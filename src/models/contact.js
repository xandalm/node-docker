import { Condition } from "../utils/condition.js";
import DB from "./connection.js";
import Model from "./model.js";
import Person from "./person.js";

/**
 * Class to represent contact.
 * @extends Model
 */
export default class Contact extends Model {

    static _filterableFields = ['id','owner','person','created_moment','deleted_moment']

    static get filterableFields() {
        return Contact._filterableFields;
    }
    /**
     * Create a contact.
     * @param {Person} owner Contact owner, the person who created contact.
     * @param {Person} person Contact person.
     * @param {Date} created_moment The moment the contact was registered.
     * @param {Date} deleted_moment The moment the contact was deleted.
     */
    constructor(owner=null,person=null,created_moment=null,deleted_moment=null) {
        super();
        this.owner = owner;
        this.person = person;
        this.created_moment = created_moment;
        this.deleted_moment = deleted_moment;
    }

    /**
     * Create a contact from object
     * @param {Object} obj The object that contains contact properties.
     * @returns {Contact}
     */
    from(obj) {
        if(typeof obj === 'object') {
            this.owner=(new Person).from(obj.owner);
            this.person=(new Person).from(obj.person);
            this.created_moment=obj.created_moment;
            this.deleted_moment=obj.deleted_moment;
            return this;
        }
        return null;
    }

    /**
     * This function parses input condition to MySQL conditions syntax. Override super class.
     * @override
     * @param {Condition} condition - The condition that will be parsed to SQL.
     * @returns {String}
     */
    _getConditionStatement(condition) {
        var s = super._getConditionStatement(condition);
        if(condition.field === 'owner' || condition.field === 'person') {
            if(condition.operator !== '==')
                throw `Invalid operator for '${condition.field}' field.`;
            s.statement = `${condition.field} = (SELECT id FROM Persons WHERE public_id = ?)`;
        }
        return s;
    }

    /**
     * Save contact.
     * @returns {ContactsGroup|null} Contact that was registered, or null if that fails.
     */
    async insert() {
        try {
            const conn = await DB.connect();
            if(this.deleted_moment==null)
                await conn.query("INSERT INTO Contacts SET ?",{
                    owner: this.owner.id,
                    person: this.person.id
                });
            else
                await conn.query("UPDATE Contacts SET created_moment = CURRENT_TIMESTAMP(), deleted_moment = NULL WHERE owner = ? AND person = ?",[
                    this.owner.id,
                    this.person.id
                ]);
            conn.release();
            return this;
        } catch (err) {
            console.log(err);
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Delete the contact.
     * @returns {Boolean}
     */
    async delete() {
        try {
            const conn = await DB.connect();
            await conn.query("UPDATE Contacts SET deleted_moment = CURRENT_TIMESTAMP() WHERE owner = ? AND person = ?",[
                this.owner.id,
                this.person.id
            ]);
            conn.release();
            return true;
        } catch (err) {
            console.log(`${err.code} - Failed to delete [${this.constructor.name}] from database`);
        }
        return false;
    }

    /**
     * Get contact.
     * @param {Person} owner The owner from the contact. May have public ID.
     * @param {Person} person The person contact. May have public ID.
     * @returns {Contact}
     */
    async get(owner,person) {
        try {
            const conn = await DB.connect();
            var [rows] = await conn.query("SELECT * FROM Contacts WHERE owner = (SELECT id FROM Persons WHERE public_id = ?) AND person = (SELECT id FROM Persons WHERE public_id = ?)",[
                owner.public_id,
                person.public_id
            ]);
            conn.release();
            if(rows.length > 0) {
                this.from({
                    created_moment: rows[0].created_moment,
                    deleted_moment: rows[0].deleted_moment,
                });
                this.owner = (new Person).getByPublicId(owner.public_id);
                this.person = (new Person).getByPublicId(person.public_id);
                return this;
            }
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    /**
     * Get list of contacts.
     * @param {Array<Condition>} conditions - Conditions to refine search results
     * 
     * Suported Fields:
     * owner,
     * person,
     * created_moment,
     * deleted_moment.
     * 
     * Suported Operators:
     * equal to (==),
     * not equal to (!=),
     * bigger than (>),
     * bigger or equal to (>=),
     * less than (<),
     * less or equal to (<=),
     * start with (^=),
     * end with ($=),
     * contains (*=).
     * 
     * @return {Array<Person>} List of contacts.
     */
    async list(config={}) {
        var rows=[];
        const { limit, offset, where, orderBy } = super.list(config);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM Contacts";
            const params = [];
            if(where) {
                sql += ' WHERE '+where.statement;
                params.push(...where.params);
            }
            if(orderBy)
                sql += ` ORDER BY ${orderBy}`;
            sql += ' LIMIT ?, ?';
            params.push(offset,limit);
            [rows] = await conn.query(sql,params);
            if(rows.length > 0) {
                // Create set with owners/persons IDs (set prevent ID repeat)
                var ids = new Set();
                rows.forEach((r) => {
                    ids.add(r.owner);
                    ids.add(r.person);
                });
                // Find persons based on set IDs
                var [rows2] = await conn.query("SELECT * FROM Persons WHERE id IN (?)",[Array.from(ids)]);
                // Create index map to persons in rows2
                var persons = {};
                rows2.forEach((r,i) => {
                    persons[r.id] = i;
                });
                // Create found contacts
                rows = rows.map(r => {
                    return new Contact(
                        (new Person).from(rows2[persons[r.owner]]),
                        (new Person).from(rows2[persons[r.person]]),
                        r.created_moment,
                        r.deleted_moment
                    );
                });
            }
            conn.release();
        } catch (err) {
            console.log(err);
        }
        return rows;
    }

    /**
     * Get the number of contacts.
     * @param {Condition} condition 
     * @returns {integer|null}
     */
    async count(condition) {
        var total = null;
        const { where } = super.list({condition});
        try {
            const conn = await DB.connect();
            var sql = "SELECT count(id) as total FROM Contacts";
            var params = [];
            if(where) {
                sql += ' WHERE '+where.statement;
                params = where.params;
            }
            [[{total}]] = await conn.query(sql, params);
            conn.release();
        } catch (err) {
            console.log(err);
        }
        return total;
    }

    /**
     * List owner contacts.
     * @param {Person} owner The owner from contacts. May have public ID.
     * @returns {Array<Contact>}
     */
    async listByOwner(owner,condition) {
        var rows=[];
        var where;
        if(condition)
            if(condition instanceof Condition)
                where = this._prepareConditionToSQL(condition);
            else
                throw new TypeError("Expected condition to be Condition type");
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM Contacts WHERE owner = (SELECT id FROM Persons WHERE public_id = ?)";
            if(where) {
                sql += ' AND '+where.statement;
                [rows] = await conn.query(sql,[owner.public_id, ...where.params]);
            } else {
                [rows] = await conn.query(sql,owner.public_id);
            }
            if(rows.length > 0) {
                // Find persons based on contacts persons IDs
                var [rows2] = await conn.query("SELECT * FROM Persons WHERE id IN (?)",[rows.map((r) => { return r.person })]);
                // Create index map to persons in rows2
                var persons = {};
                rows2.forEach((r,i) => {
                    persons[r.id] = i;
                });
                // Create found contacts
                rows = rows.map(r => {
                    return new Contact(
                        owner,
                        (new Person).from(rows2[persons[r.person]]),
                        r.created_moment,
                        r.deleted_moment
                    );
                });
            }
            conn.release();
        } catch(err) {
            console.log(err);
        }
        return rows;
    }
}
