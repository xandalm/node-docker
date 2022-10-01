import hashint from '@xandealm/hashint';

import DB from "./connection.js";

import Model from "./model.js";
import Person from "./person.js";
import { Condition } from '../utils/condition.js';

/**
 * Class to represent contacts group.
 * @extends Model
 */
export default class ContactsGroup extends Model {

    static _filterableFields = [/* 'owner','number', */'description','created_moment']

    static get filterableFields() {
        return ContactsGroup._filterableFields;
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
            this.id=obj.id;
            this.public_id=obj.public_id;
            this.owner=(new Person).from(obj.owner);
            this.description=obj.description;
            this.created_moment=obj.created_moment;
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
        if(condition.field === 'owner') {
            if(condition.operator !== '==')
                throw `Invalid operator for '${condition.field}' field.`;
            s.statement = "owner = (SELECT id FROM Persons WHERE public_id = ?)";
        }
        return s;
    }

    /**
     * Save contacts group.
     * @returns {ContactsGroup|null} Group that was registered, or null if that fails.
     */
    async insert() {
        var response = null;
        try {
            const conn = await DB.connect();
            conn.beginTransaction();
            try {
                var [res] = await conn.query(
                    "INSERT INTO ContactsGroups SET owner = ?, description = ?",[
                    this.owner.id,
                    this.description
                ]);
                this.id = res.insertId;
                this.public_id = hashint.hashint16(this.id,'contactsgroupstable');
                await conn.query("UPDATE ContactsGroups SET public_id = ? WHERE id = ?",[this.public_id, this.id]);
                conn.commit();
                this.created_moment = (new ContactsGroup).getById(this.id).created_moment;
                response = this;    
            } catch (err) {
                conn.rollback();
                if(process.env.NODE_ENV === 'dev')
                    console.log(err);
            }
            conn.release();
        } catch(err) { }
        return response;
    }

    /**
     * Update contacts group.
     * @returns {Boolean}
     */
    async update() {
        const conn = await DB.connect();
        var response = false;
        try {
            await conn.query("UPDATE ContactsGroups SET description = ? WHERE public_id = ?",[this.description, this.public_id]);
            response = true;
        } catch(err) {
            if(process.env.NODE_ENV === 'dev')
                console.log(err);
        }
        return response;
    }

    /**
     * Delete contacts group.
     * @returns {Boolean} [True] if succeded [False] if not.
     */
    async delete() {
        var response = false;
        try {
            const conn = await DB.connect();
            conn.beginTransaction();
            try {
                await conn.query("DELETE FROM ContactsGroupsLinks WHERE group = ?",[this.id]);
                await conn.query("DELETE FROM ContactsGroups WHERE id = ?",[this.id]);
                conn.commit();
                response = true;
            } catch(err) {
                conn.rollback();
                if(process.env.NODE_ENV === 'dev')
                    console.log(err);
            }
            conn.release();
        } catch(err) { }
        return response;
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
                this.owner = (new Person).getById(this.owner.id);
                return this;
            }
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    /**
     * Get contacts group by ID.
     * @param {Person} owner The person identificator. May have ID or public ID.
     * @param {String} id The contacts group identificator.
     * @returns {ContactsGroup|null}
     */
    getById(id) {
        return this.#get("SELECT * FROM ContactsGroups WHERE id = ?",[id]);
    }

    /**
     * Get contacts group by public ID.
     * @param {String} id The contacts group public identificator.
     * @returns {ContactsGroup|null}
     */
    getByPublicId(id) {
        return this.#get("SELECT * FROM ContactsGroups WHERE public_id = ?",[id]);
    }

    /**
     * Get list of contacts groups.
     * @param {Array<Condition>} conditions Conditions to refine search results
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
    async list(config={}) {
        var rows=[];
        const { limit, offset, where, orderBy } = super.list(config);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM ContactsGroups";
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
        } catch (err) {
            if(process.env.NODE_ENV === 'dev')
                console.log(err);
        }
        return rows;
    }

    /**
     * Get the number of records.
     * @param {Condition} condition 
     * @returns {integer|null}
     */
    async count(condition) {
        var total = null;
        const { where } = super.list({condition});
        try {
            const conn = await DB.connect();
            var sql = "SELECT count(id) as total FROM ContactsGroups";
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
     * List owner contacts groups.
     * @param {Person} owner 
     * @param {Array<Condition>} conditions Conditions to refine search results
     * Supported fields: the same as in the `list` method.
     * Supported operators: the same as in the `list` method.
     * @returns {Array<ContactsGroup>}
     */
    async listByOwner(owner, condition=null) {
        var rows=[];
        var where;
        if(condition)
            if(condition instanceof Condition)
                where = this._prepareConditionToSQL(condition);
            else
                throw new TypeError("Expected condition to be Condition type");
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM ContactsGroups WHERE owner = (SELECT id FROM Persons WHERE public_id = ?)";
            if(where) {
                sql += ' AND '+where.statement;
                [rows] = await conn.query(sql,[owner.public_id, ...where.params]);
            } else {
                [rows] = await conn.query(sql,owner.public_id);
            }
            rows = rows.map(r => new ContactsGroup(
                    r.id,
                    r.public_id,
                    owner,
                    r.description,
                    r.created_moment
                ));
        } catch (err) {
            console.log(err);
        }
        return rows;
    }
}