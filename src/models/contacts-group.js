import DB from "./connection.js";

import Model from "./model.js";
import Person from "./person.js";

/**
 * Class to represent contacts group.
 * @extends Model
 */
export default class ContactsGroup extends Model {

    static get filterableFields() {
        return [/* 'owner','number', */'description','created_moment'];
    }

    /**
     * 
     * @param {number} number Group sequence.
     * @param {Person} owner Group owner, the person who created the group.
     * @param {String} description Group description.
     * @param {Date} created_moment The moment the group was registered.
     */
    constructor(number=null,owner=null,description=null,created_moment=null) {
        super();
        this.number = number;
        this.owner = owner;
        this.description = description;
        this.created_moment = created_moment;
    }

    /**
     * Create a contacts group from object.
     * @param {Object} obj The object that contains person properties.
     * @returns {ContactsGroup}
     */
    from(obj) {
        if(typeof obj === 'object') {
            this.number=obj.number??null;
            this.owner=(new Person).from(obj.owner);
            this.description=obj.description??null;
            this.created_moment=obj.created_moment??null;
        }
        return this;
    }

    /**
     * This function parses input filter to MySQL conditions syntax.
     * Override super class.
     * 
     * At super class (Model): 
     * The Filter object will have the value property modified if needed.
     * Example: The operator (field ^= string) is (field LIKE 'string%') in MySQL then the value from Filter object will be changed from `string` to `string%`. The function return will be `field LIKE ?`
     * 
     * In this class (ContactsGroup): 
     * The field `owner` cause a special return and only work if the operator is `==`, i. e. `owner==[any owner public_id]`.
     * 
     * @param {Filter} filter - The filter that will be parsed to SQL.
     * 
     * @returns {String}
     */
    parseFilter(filter) {
        if(filter.field === 'owner') {
            if(filter.operator !== '==')
                throw `Invalid operator for '${filter.field}' field.`;
            return `owner = (SELECT id FROM Persons WHERE public_id = ?)`;
        } else {
            return super.parseFilter(filter);
        }
    }

    /**
     * Save contacts group informations in DB.
     * @returns {ContactsGroup|null} Group that was registered, or null if that fails.
     */
    async insert() {
        try {

            const conn = await DB.connect();

            await conn.beginTransaction();
            
            const res = await conn.query("INSERT INTO ContactsGroups SET number = (SELECT (MAX(`number`) + 1) as last_number FROM ContactsGroups WHERE `owner` = ?), description = ?, owner = ?",[
                this.owner.id,
                this.description,
                this.owner.id,
            ]);

            this.created_moment = (await (new ContactsGroup).getByOwner(this.owner,this.description)).created_moment;

            await conn.commit();
            conn.release();

            return this;
        } catch (err) {
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Delete the contacts group fisically from DB.
     * @returns {Boolean} [True] if succeded [False] if not.
     */
    async delete() {
        try {
            var res;
            const conn = await DB.connect();
            await conn.beginTransaction();
            res = await conn.query("DELETE FROM ContactsGroups WHERE owner = (SELECT id FROM Persons WHERE public_id = ?) AND number = ?",[
                this.owner.public_id,
                this.number
            ]);
            res = await conn.query("UPDATE ContactsGroups SET number = number - 1 WHERE owner = (SELECT id FROM Persons WHERE public_id = ?) AND number > ?",[
                this.owner.public_id,
                this.number
            ]);
            await conn.commit();
            conn.release();
            return true;
        } catch (err) {
            console.log(`${err.code} - Failed to delete [${this.constructor.name}] from database`);
        }
        return false;
    }

    /**
     * Generic method to get one contacts group.
     * @param {String} query The SQL statement.
     * @param {Array<(String|number)>} params Params to compose statement.
     * @returns {Person|null} Group of contacts found.
     */
    async #get(query="",params=[]) {
        let rows=[];
        try {
            const conn = await DB.connect();
            [rows] = await conn.query(query,params);
            conn.release();
            if(rows.length) {
                this.from(rows[0]);
            }
            return this;
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    /**
     * Get group from DB by owner and description.
     * @param {Person} owner The person identificator. May have ID or public ID.
     * @param {String} description The group description.
     * @returns {Person|null}
     */
    async getByOwner(owner,description) {
        var cg;
        if(owner.id)
            cg = await this.#get("SELECT * FROM ContactsGroups WHERE owner = ? AND description = ?",[owner.id,description]);
        else if(owner.public_id)
            cg = await this.#get("SELECT * FROM ContactsGroups WHERE owner = (SELECT id FROM Persons WHERE public_id = ?) AND description = ?",[owner.public_id,description]);
        else
            throw "The informed owner must have ID or public ID";
        cg.owner = owner;
        return cg;
    }

    /**
     * Get list of contacts groups.
     * 
     * @param {Array<Filter>} filters Filters to refine search results
     * 
     * Supported fields:
     * description,
     * created_moment.
     * 
     * Supported operators:
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
     * @return {Array<ContactsGroup>} List of contacts groups.
     */
    async list(filters=[]) {
        let rows=[];
        let where;
        if(filters.length)
            where = this.parseFilters(filters);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM ContactsGroups";
            if(where) {
                sql += ' WHERE '+where.statements.join(' AND ');
                [rows] = await conn.query(sql,where.values);
            }
            else
                [rows] = await conn.query(sql);
            if(rows.length) {
                let [rows2] = await conn.query("SELECT * FROM Persons WHERE id IN (?)",[rows.map((r) => {return r.owner})]);
                conn.release();
                let persons = {};
                rows2.forEach(r => {
                    persons[r.id] = r;
                });
                rows = rows.map(r => {
                    const p = persons[r.owner];
                    return new ContactsGroup(
                        r.number,
                        (new Person).from(p),
                        r.description,
                        r.created_moment
                    );
                });
            }
            return rows;
        } catch (err) {
            console.log(err);
        }
        return rows;
    }

    /**
     * 
     * @param {Person} person 
     * @param {Array<Filter>} filters Filters to refine search results
     * Supported fields: the same as in the `list` method.
     * Supported operators: the same as in the `list` method.
     * @returns {Array<ContactsGroup>}
     */
    async listByPerson(person, filters=[]) {
        let rows=[];
        let where;
        if(filters.length)
            where = this.parseFilters(filters);
        try {
            const conn = await DB.connect();
            var sql = "SELECT number,description,created_moment FROM ContactsGroups WHERE owner = (SELECT id FROM Persons WHERE public_id = ?)";
            if(where) {
                sql += ' AND '+where.statements.join(' AND ');
                [rows] = await conn.query(sql,[person.public_id, ...where.values]);
            } else {
                [rows] = await conn.query(sql,person.public_id);
            }
            rows = rows.map(r => {
                return new ContactsGroup(
                    r.number,
                    null,
                    r.description,
                    r.created_moment
                );
            });
            return rows;
        } catch (err) {
            console.log(err);
        }
        return rows;
    }
}