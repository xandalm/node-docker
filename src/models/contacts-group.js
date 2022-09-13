import hashint from '@xandealm/hashint';

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
     * @param {number} id Group identificator.
     * @param {String} public_id Group public identificator.
     * @param {Person} owner Group owner, the person who created the group.
     * @param {String} description Group description.
     * @param {Date} created_moment The moment the group was registered.
     */
    constructor(id=null,public_id=null,owner=null,description=null,created_moment=null) {
        super();
        this.id = id;
        this.public_id = public_id;
        this.owner = owner;
        this.description = description;
        this.created_moment = created_moment;
    }

    /**
     * Create a contacts group from object.
     * @param {Object} obj The object that contains contacts group properties.
     * @returns {ContactsGroup}
     */
    from(obj) {
        if(typeof obj === 'object') {
            this.id=obj.id??null;
            this.public_id=obj.public_id??null;
            this.owner=(new Person).from(obj.owner)??this.person;
            this.description=obj.description??null;
            this.created_moment=obj.created_moment??null;
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
        const conn = await DB.connect();
        try {
            conn.beginTransaction();
            var [res] = await conn.query(
                "INSERT INTO ContactsGroups SET owner = ?, description = ?",[
                this.owner.id,
                this.description
            ]);
            this.id = res.insertId;
            this.public_id = hashint.hashint16(this.id,'contactsgroupstable');
            await conn.query("UPDATE ContactsGroups SET public_id = ? WHERE id = ?",[this.public_id, this.id]);
            conn.commit();
            this.created_moment = (await (new ContactsGroup).getById(this.id)).created_moment;
            res = this;    
        } catch (err) {
            conn.rollback();
            if(process.env.NODE_ENV === 'dev')
                console.log(err);
            res = null;
        }
        conn.release();
        return res;
    }

    async update() {
        const conn = await DB.connect();
        res = false;
        try {
            var [res] = await conn.query("UPDATE ContactsGroups SET description = ? WHERE public_id = ?",[this.description, this.public_id]);
            res = res.affectedRows === 1;
        } catch(err) {
            if(process.env.NODE_ENV === 'dev')
                console.log(err);
        }
        return res;
    }

    /**
     * Delete the contacts group fisically from DB.
     * @returns {Boolean} [True] if succeded [False] if not.
     */
    async delete() {
        const conn = await DB.connect();
        var res = false;
        try {
            conn.beginTransaction();
            await conn.query("DELETE FROM ContactsGroupsLinks WHERE group = ?",[this.id]);
            await conn.query("DELETE FROM ContactsGroups WHERE id = ?",[this.id]);
            conn.commit();
            res = true;
        } catch (err) {
            if(process.env.NODE_ENV === 'dev')
                console.log(err);
            conn.rollback();
        }
        conn.release();
        return res;
    }

    /**
     * Generic method to get one contacts group.
     * @param {String} query The SQL statement.
     * @param {Array<(String|number)>} params Params to compose statement.
     * @returns {ContactsGroup|null} Group of contacts found.
     */
    async #get(query="",params=[]) {
        try {
            const conn = await DB.connect();
            var [rows] = await conn.query(query,params);
            conn.release();
            if(rows.length > 0) {
                this.from({...rows[0], owner: { id: rows[0].owner}});
                this.owner = await (new Person).getById(this.owner.id);
                return this;
            }
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    /**
     * Get group from DB by ID.
     * @param {Person} owner The person identificator. May have ID or public ID.
     * @param {String} id The contacts group identificator.
     * @returns {ContactsGroup|null}
     */
     async getById(id) {
        var cg = await this.#get("SELECT * FROM ContactsGroups WHERE id = ?",[id]);
        return cg;
    }

    /**
     * Get group from DB by public ID.
     * @param {String} id The contacts group public identificator.
     * @returns {ContactsGroup|null}
     */
     async getByPublicId(id) {
        var cg = await this.#get("SELECT * FROM ContactsGroups WHERE public_id = ?",[id]);
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
        var rows=[];
        var where;
        if(filters.length > 0)
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
            if(rows.length > 0) {
                var [rows2] = await conn.query("SELECT * FROM Persons WHERE id IN (?)",[rows.map((r) => {return r.owner})]);
                conn.release();
                var persons = {};
                rows2.forEach(r => {
                    persons[r.id] = r;
                });
                rows = rows.map(r => {
                    const p = persons[r.owner];
                    return new ContactsGroup(
                        r.id,
                        r.public_id,
                        (new Person).from(p),
                        r.description,
                        r.created_moment
                    );
                });
            }
            return rows;
        } catch (err) {
            if(process.env.NODE_ENV === 'dev')
                console.log(err);
        }
        return rows;
    }

    /**
     * List contacts groups registered to owner.
     * @param {Person} person 
     * @param {Array<Filter>} filters Filters to refine search results
     * Supported fields: the same as in the `list` method.
     * Supported operators: the same as in the `list` method.
     * @returns {Array<ContactsGroup>}
     */
    async listByPerson(person, filters=[]) {
        var rows=[];
        var where;
        if(filters.length > 0)
            where = this.parseFilters(filters);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM ContactsGroups WHERE owner = (SELECT id FROM Persons WHERE public_id = ?)";
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