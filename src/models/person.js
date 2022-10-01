import DB from './connection.js';
import {v4 as uuidv4} from 'uuid';

import Model from './model.js';
import { Condition } from '../utils/condition.js'

/**
 * Class to represent person.
 * @extends Model
 */
export default class Person extends Model {

    static _filterableFields = ['id','public_id','name','first_name','last_name','birthday','email','status','created_moment','deleted_moment']

    static get filterableFields() {
        return Person._filterableFields;
    }

    /**
     * Create a person.
     * @param {number} id Person identificator.
     * @param {String} public_id Person public identificator.
     * @param {String} first_name Person first name.
     * @param {String} last_name Person last name.
     * @param {Date} birthday Person birthday (exclude time).
     * @param {String} email Person email identification.
     * @param {Boolean} status The status from this person, true[active], false[inactive].
     * @param {Date} created_moment The moment the person was registered.
     * @param {Date} deleted_moment The moment the person was logically removed.
     */
    constructor(id=null,public_id=null,first_name=null,last_name=null,birthday=null,email=null,status=null,created_moment=null,deleted_moment=null) {
        super();
        this.id = id;
        this.public_id = public_id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.name = (this.first_name && this.last_name)?`${this.first_name} ${this.last_name}`.trim():null;
        this.birthday = birthday;
        this.email = email;
        this.status = status;
        this.created_moment = created_moment;
        this.deleted_moment = deleted_moment;
    }

    /**
     * Create a person from object.
     * @param {Object} obj The object that contains person properties.
     * @returns {Person}
     */
    from(obj) {
        if(typeof obj === 'object') {
            this.id = obj.id;
            this.public_id = obj.public_id;
            this.first_name = obj.first_name?.trim();
            this.last_name = obj.last_name?.trim();
            this.name = this.first_name ? (this.last_name? `${this.first_name} ${this.last_name}`: this.first_name): null;
            this.birthday = obj.birthday;
            this.email = obj.email;
            this.status = obj.status;
            this.created_moment = obj.created_moment;
            this.deleted_moment = obj.deleted_moment;
            return this;
        }
        return null;
    }

    /**
     * This function parses input condition to MySQL conditions syntax. Override super class.
     * @param {Condition} condition - The condition that will be parsed to SQL.
     * 
     * @returns {String}
     */
    _getConditionStatement(condition) {
        var s = super._getConditionStatement(condition);
        if(condition.field == 'name')
            s.statement = s.statement.replace(/name/,"CONCAT(first_name,' ',last_name)");
        return s;
    }

    /**
     * Save person.
     * @returns {Person|null} Person that was registered, or null if that fails.
     */
    async insert() {
        try {
            this.public_id = uuidv4();
            const conn = await DB.connect();
            await conn.query("INSERT INTO Persons SET ?",{
                public_id: this.public_id,
                first_name: this.first_name,
                last_name: this.last_name,
                birthday: this.birthday,
                email: this.email
            });
            conn.release();
            return this;
        } catch (err) {
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Update person.
     * @returns {Person|null} The updated person, or null if that fails.
     */
    async update() {
        try {
            const conn = await DB.connect();
            await conn.query("UPDATE Persons SET ? WHERE public_id = ?",[{
                public_id: this.public_id,
                first_name: this.first_name,
                last_name: this.last_name,
                birthday: this.birthday,
                email: this.email,
            },this.public_id]);
            conn.release();
            return this;
        } catch (err) {
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Delete the person.
     * @returns {Boolean} [True] if succeded [False] if not.
     */
    async delete() {
        try {
            const conn = await DB.connect();
            await conn.query("UPDATE Persons SET deleted_moment = CURRENT_TIMESTAMP() WHERE public_id = ?",[
                this.public_id,
            ]);
            conn.release();
            return true;
        } catch (err) {
            console.log(`${err.code} - Failed to delete [${this.constructor.name}] from database`);
        }
        return false;
    }

    /**
     * Generic method to get one person.
     * @param {String} query The SQL statement.
     * @param {Array<(String|number)>} params Params to compose statement.
     * @returns {Person|null} Person found.
     */
    async #get(query="",params=[]) {
        try {
            const conn = await DB.connect();
            var [rows] = await conn.query(query,params);
            conn.release();
            if(rows.length > 0) {
                this.from(rows[0]);
                return this;
            }
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    /**
     * Get person by internal ID.
     * @param {number} id The person identificator.
     * @returns {Person|null}
     */
    getById(id) {
        return this.#get("SELECT * FROM Persons WHERE id = ?",[id]);
    }

    /**
     * Get person by public ID.
     * @param {String} id  - The person public identificator (uuid).
     * @returns {Person|null}
     */
    getByPublicId(id) {
        return this.#get("SELECT * FROM Persons WHERE public_id = ?",[id]);
    }

    /**
     * Get person by email.
     * @param {String} email  - The person email.
     * @returns {Person|null}
     */
    getByEmail(email) {
        return this.#get("SELECT * FROM Persons WHERE email = ?",[email]);
    }

    /**
     * Get list of persons.
     * @param {Array<Condition>} conditions - Conditions to refine search results
     * 
     * Suported Fields:
     * public_id,
     * first_name,
     * last_name,
     * name (this will concatenate first_name and last_name),
     * birthday,
     * email,
     * status,
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
     * @return {Array<Person>} List of persons.
     */
    async list(config={}) {
        var rows=[];
        const { limit, offset, where, orderBy } = super.list(config);
        try {
            const conn = await DB.connect();
            var sql = "SELECT * FROM Persons";
            const params = [];
            if(where) {
                sql += ' WHERE '+where.statement;
                // params = where.params;
                params.push(...where.params);
            }
            if(orderBy)
                sql += ` ORDER BY ${orderBy}`;
            sql += ' LIMIT ?, ?';
            params.push(offset,limit);
            [rows] = await conn.query(sql, params);
            conn.release();
            rows = rows.map(r => (new Person).from(r));
        } catch (err) {
            console.log(err);
        }
        return rows;
    }

    /**
     * Get the number of persons
     * @param {Condition} condition 
     * @returns {number}
     */
    async count(condition) {
        var total = null;
        const { where } = super.list({condition});
        try {
            const conn = await DB.connect();
            var sql = "SELECT count(id) as total FROM Persons";
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

}
