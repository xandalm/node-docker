import { Condition, LogicalCondition, RelationalCondition, RelationalOperatorContains, RelationalOperatorEndWith, RelationalOperatorEqual, RelationalOperatorStartWith } from "../utils/condition.js";
import { OrderBy } from "../utils/order.js";
import { DatePattern } from "../utils/regexp-patterns.js";

/**
 * Class to represent database entities
 */
export default class Model {

    /**
     * Abstract method to init class instance from object.
     * @abstract
     * @param {Object} obj 
     */
    from(obj) {
        throw new TypeError('The method must be implemented');
    }

    /**
     * Get MySQL statement and param from condition.
     * @param {Condition} condition 
     * @returns {Object}
     */
    _getConditionStatement(condition) {
        var { field, operator, value} = condition;
        if((field == 'created_moment' || field == 'deleted_moment') && !DatePattern.test(value)) {
            throw `Invalid '${value}' value to '${field}' field.`;
        }
        if((/^(null|undefined)$/i).test(value))
            value = null;
        else if((/^({null}|{undefined})$/i).test(value))
            value = value.substring(1,value.length-1);
        if(operator instanceof RelationalOperatorEqual) {
            if(value == null) {
                operator = ' IS ';
            } else 
                operator = ' = ';
        }
        else if(operator instanceof RelationalOperatorStartWith){
            operator = ` LIKE `; 
            value = `${value}%`;
        }
        else if(operator instanceof RelationalOperatorEndWith) {
            operator = ' LIKE ';
            value = `%${value}`;
        }
        else if(operator instanceof RelationalOperatorContains) {
            operator = ' LIKE ';
            value = `%${value}%`;
        }
        else {
            operator = ` ${operator.toString()} `;
        }
        return {statement: `${field}${operator}?`, param: value};
    }

    /**
     * Parse Condition to SQL representations for 'where' statement.
     * Will consider 'filterableFields' static attribute of the instantiated class name (inheritors).
     * @param {Object} condition
     * @returns 
     */
    _prepareConditionToSQL(condition) {
        // throw `Invalid '${e.field}' field to apply filter`;
        var statement = '', params = [], queue = [];
        queue.push(condition);
        while(queue.length > 0) {
            condition = queue.shift();
            if(condition instanceof LogicalCondition) {
                queue.push('(');
                for (let i = 0; i < condition.subconditions.length-1; i++) {
                    queue.push(condition.subconditions[i]);
                    queue.push(` ${condition.operator} `);
                }
                queue.push(condition.subconditions.at(-1));
                queue.push(')');
            } else if(condition instanceof RelationalCondition) {
                if(this.constructor.filterableFields.includes(condition.field)){
                    let parsed = this._getConditionStatement(condition);
                    statement = `${statement}${parsed.statement}`;
                    params.push(parsed.param);
                } else
                    throw `Cannot filter ${condition.field} field`;
            } else
                statement = `${statement}${condition}`;
        }
        return {statement, params};
    }

    /**
     * Parse OrderBy to SQL representations for 'order by' statement.
     * Will consider 'filterableFields' static attribute of the instantiated class name (inheritors).
     * @param {Object} orderBy
     * @returns 
     */
    _prepareOrderToSQL(orderBy) {
        if(this.constructor._filterableFields.includes(orderBy?.field)) {
            return `${orderBy.field} ${orderBy.order}`;
        }
        throw `Cannot order by ${orderBy.field} field`;
    }
    
    /**
     * Insert data into database
     * @abstract
     */
    insert() {
        throw new TypeError('The method must be implemented');
    }

    /**
     * Update data from database
     * @abstract
     */
    update() {
        throw new TypeError('The method must be implemented');
    }

    /**
     * Delete data from database
     * @abstract
     */
    delete() {
        throw new TypeError('The method must be implemented');
    }

    /**
     * List data from database
     * @param {Object} config
     * @returns {Object}
     */
    list(config={}) {
        var where, order;
        const page = config.page??1;
        const limit = config.limit??20;
        if(page && (!Number.isInteger(page) || page < 1))
            throw new TypeError("Illegal page argument type");
        if(limit && (!Number.isInteger(limit) || limit < 0))
            throw new TypeError("Illegal limit argument type");
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const condition = config.condition;
        const orderBy = config.orderBy;
        if(condition)
            if(condition instanceof Condition)
                where = this._prepareConditionToSQL(condition);
            else
                throw new TypeError("Expected condition to be Condition type");
        if(orderBy)
            if(orderBy instanceof OrderBy)
                order = this._prepareOrderToSQL(orderBy);
            else if(Array.isArray(orderBy)) {
                for (const o of orderBy) {
                    if(!o instanceof OrderBy)
                        throw new TypeError("Expected orderBy to be OrderBy or Array<OrderBy> types");
                    else {
                        order = `${order}, ${this._prepareOrderToSQL(o)}`;
                    }
                }
            }
            else
                throw new TypeError("Expected orderBy to be OrderBy or Array<OrderBy> types");
        return { page, limit, offset, where, orderBy: order };
    }

}