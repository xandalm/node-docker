import DB from './connection.js';
import {v4 as uuidv4} from 'uuid';

import Model from './model.js';

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
            this.id = obj.id??null;
            this.public_id = obj.public_id??null;
            this.first_name = obj.first_name??null;
            this.last_name = obj.last_name??null;
            this.name = (this.first_name && this.last_name)?`${this.first_name} ${this.last_name}`.trim():null;
            this.birthday = obj.birthday??null;
            this.email = obj.email??null;
            this.status = obj.status??null;
            this.created_moment = obj.created_moment??null;
            this.deleted_moment = obj.deleted_moment??null;
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
     * In this class (Person): 
     * The field property in Filter object will be modified to `CONCAT(first_name,' ',last_name)` when it's `name`.
     * @param {Filter} filter - The filter that will be parsed to SQL.
     * 
     * @returns {String}
     */
    parseFilter(filter) {
        filter.field = (filter.field == 'name')?"CONCAT(first_name,' ',last_name)":filter.field
        return super.parseFilter(filter);
    }

    /**
     * Save person informations in DB.
     * @returns {Person|null} Person that was registered, or null if that fails.
     */
    async insert() {
        try {
            this.public_id = uuidv4();
            const conn = await DB.connect();
            const res = await conn.query("INSERT INTO Persons SET ?",{
                public_id: this.public_id,
                first_name: this.first_name,
                last_name: this.last_name,
                birthday: this.birthday,
            });
            conn.release();
            return this;
        } catch (err) {
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Update person informations in DB.
     * @returns {Person|null} The updated person, or null if that fails.
     */
    async update() {
        try {
            const conn = await DB.connect();
            const res = await conn.query("UPDATE Persons SET ? WHERE public_id = ?",[{
                public_id: this.public_id,
                first_name: this.first_name,
                last_name: this.last_name,
                birthday: this.birthday,
            },this.public_id]);
            await this.getByPublicId(this.public_id);
            conn.release();
            return this;
        } catch (err) {
            console.log(`${err.code} - Failed to create [${this.constructor.name}] at database`);
        }
        return null;
    }

    /**
     * Delete the person logically from DB.
     * @returns {Boolean} [True] if succeded [False] if not.
     */
    async delete() {
        
        try {
            const conn = await DB.connect();
            const res = await conn.query("DELETE FROM Persons WHERE public_id=?",[
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
     * Get person from DB by internal ID.
     * @param {number} id The person identificator.
     * @returns {Person|null}
     */
    async getById(id) {
        return await this.#get("SELECT * FROM Persons WHERE id = ?",[id]);
    }

    /**
     * Get person from DB by public ID.
     * @param {String} id  - The person public identificator (uuid).
     * @returns 
     */
    async getByPublicId(id) {
        return await this.#get("SELECT * FROM Persons WHERE public_id = ?",[id]);
    }

    /**
     * Get list of persons.
     * 
     * @param {Array<Filter>} filters - Filters to refine search results
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
    async list(filters=[]) {
        let rows=[];
        var where;
        if(filters.length > 0)
            where = this.parseFilters(filters);
        try {
            const conn = await DB.connect();
            var sql = "SELECT public_id,first_name,last_name,birthday FROM Persons";
            if(where) {
                sql += ' WHERE '+where.statements.join(' AND ');
                [rows] = await conn.query(sql,where.values);
            } else {
                [rows] = await conn.query(sql);
            }
            conn.release();
            // rows = rows.map((r) => {
            //     let {id, ...data} = r;
            //     data.birthday = data.birthday.toISOString();
            //     return data;
            // });
            return rows;
        } catch (err) {
            console.log(err);
        }
        return rows;
    }

}
