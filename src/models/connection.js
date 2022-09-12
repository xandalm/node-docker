import dbconfig from '../config/db.config.js';
import mysql from 'mysql2/promise';

/**
 * Class to represent database
 */
export default class DB {

    static pool = mysql.createPool({
        connectionLimit: dbconfig.pool.max,
        host: dbconfig.host,
        user: dbconfig.user,
        password: dbconfig.password,
        database: dbconfig.db
    })

    static async connect() {
        return await DB.pool.getConnection();
    }

    static async end() {
        return await DB.pool.end();
    }
}
