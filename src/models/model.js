
/**
 * Class to represent database entities
 */
export default class Model {

    /**
     * Abstract method to init class instance from object.
     * @param {Object} obj 
     */
    from(obj) {
        throw new TypeError('The method must be overridden.');
    }

    /**
     * 
     * @param {Filter} filter 
     * This function parses input filter to MySQL conditions syntax.
     * The Filter object will have the value property modified if needed.
     * Example: The operator (field ^= string) is (field LIKE 'string%') in MySQL then the value from Filter object will be changed from `string` to `string%`. The function return will be `field LIKE ?`
     * @returns {String}
     */
    parseFilter(filter) {
        var o;
        if(/^==$/.test(filter.operator))
            o = ' = ';
        else if(/^\^=$/.test(filter.operator)){
            o = ` LIKE `; 
            filter.value = `${filter.value}%`;
        }
        else if(/^\$=$/.test(filter.operator)) {
            o = ' LIKE ';
            filter.value = `%${filter.value}`;
        }
        else if(/^\*=$/.test(filter.operator)) {
            o = ' LIKE ';
            filter.value = `%${filter.value}%`;
        }
        else {
            o = ` ${filter.operator} `;
        }
        return `${filter.field}${o}?`;
    }

    /**
     * Parse Filter instances to SQL representations for 'where' statement.
     * Will consider 'filterableFields' static attribute of the instantiated class name (inheritors).
     * @param {Array<Filter>} filters Filters list.
     * @returns 
     */
     parseFilters(filters) {
        // throw `Invalid '${e.field}' field to apply filter`;
        let where={statements:[],values:[]};
        for (let i = 0; i < filters.length; i++) {
            const e = filters[i];
            if(this.constructor.filterableFields.indexOf(e.field) > -1){
                where.statements.push(this.parseFilter(e));
                where.values.push(e.value);
            }
            else
                throw `'${e.field}' field cannot be filtered`;
        }
        return where;
    }

    /**
     * Abstract method to implement search from records in the database.
     * @param {*} filters 
     */
    list(filters={}) {
        throw new TypeError('The method must be overridden.');
    }

}