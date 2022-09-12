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
        return Person._filterableFields;
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
            this.owner=(new Person).from(obj.owner)??this.owner;
            this.person=(new Person).from(obj.person)??this.person;
            this.created_moment=obj.created_moment??null;
            this.deleted_moment=obj.deleted_moment??null;
            return this;
        }
        return null;
    }

    /**
     * This function parses input filter to MySQL conditions syntax.
     * Override super class.
     * 
     * At super class (Model): 
     * The Filter object will have the value property modified if needed.
     * Example: The operator (field ^= string) is (field LIKE 'string%') in MySQL then the value from Filter object will be changed from `string` to `string%`. The function return will be `field LIKE ?`
     * 
     * In this class (Contact): 
     * The field `owner` cause a special return and only work if the operator is `==`, i. e. `owner==[any owner public_id]`. It happens to `person` field too.
     * 
     * @param {Filter} filter - The filter that will be parsed to SQL.
     * 
     * @returns {String}
     */
    parseFilter(filter) {
        if(filter.field === 'owner' || filter.field === 'person') {
            if(filter.operator !== '==')
                throw `Invalid operator for '${filter.field}' field.`;
            return `${filter.field} = (SELECT id FROM Persons WHERE public_id = ?)`;
        }
        else
            return super.parseFilter(filter);
    }

    /**
     * Save contact informations in DB.
     * @returns {ContactsGroup|null} Contact that was registered, or null if that fails.
     */
    async insert() {
        try {
            var res;
            const conn = await DB.connect();
            
            if(this.deleted_moment==null)
                res = await conn.query("INSERT INTO Contacts SET ?",{
                    owner: this.owner.id,
                    person: this.person.id
                });
            else
                res = await conn.query("UPDATE Contacts SET created_moment = CURRENT_TIMESTAMP(), deleted_moment = NULL WHERE owner = ? AND person = ?",[
                    this.owner.id,
                    this.person.id
                ]);

            await this.get(this.owner,this.person);

            conn.release();

            return this;
        } catch (err) {
            console.log(err);
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Delete the contact logically from DB.
     * @returns {Boolean} [True] if succeded [False] if not.
     */
     async delete() {
        try {
            const conn = await DB.connect();
            var res = await conn.query("UPDATE Contacts SET deleted_moment = CURRENT_TIMESTAMP() WHERE owner = ? AND person = ?",[
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
     * Get contact from database.
     * @param {*} owner The owner from the contact. May have public ID.
     * @param {*} person The person contact. May have public ID.
     * @returns 
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
                this.owner = await (new Person).getByPublicId(owner.public_id);
                this.person = await (new Person).getByPublicId(person.public_id);
                return this;
            }
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    /**
     * Get list of contacts.
     * 
     * @param {Array<Filter>} filters - Filters to refine search results
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
     async list(filters=[]) {
        var rows=[];
        var where;
        if(filters.length > 0)
            where = this.parseFilters(filters);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM Contacts";
            if(where) {
                sql += ' WHERE '+where.statements.join(' AND ');
                [rows] = await conn.query(sql,where.values);
            } else {
                [rows] = await conn.query(sql);
            }
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
            return rows;
        } catch (err) {
            console.log(err);
        }
        return rows;
    }

    /**
     * List contacts registered to owner.
     * @param {Person} owner The owner from contacts. May have public ID.
     * @returns {Array<Contact>}
     */
    async listByOwner(owner,filters=[]) {
        var rows=[];
        var where;
        if(filters.length > 0)
            where = this.parseFilters(filters);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM Contacts WHERE owner = (SELECT id FROM Persons WHERE public_id = ?)";
            if(where) {
                sql += ' AND '+where.statements.join(' AND ');
                [rows] = await conn.query(sql,[owner.public_id, ...where.values]);
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
