/**
 * Class to represent filter from requests
 */
export default class Filter {

    // order by length, desc
    static operators = ['==','!=','>=','<=','^=','$=','*=','>','<']

    static get operators_regexp_pattern() {
        return new RegExp(Filter.operators.join('|').replace(/[\^\$\*\!]/g,'\\$&'));
    }

    /**
     * Create a filter.
     * @param {String} field Filter field.
     * @param {String} operator Filter operator.
     * @param {String|number} value Filter comparable/expected value.
     */
    constructor(field,operator,value) {
        if(!Filter.validate(`${field}${operator}${value}`))
            throw new TypeError("Invalid to construct type");
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    /**
     * Check if the string can be a filter.
     * @param {String} str String who represents filter (field)(operator)(value), i. e.: name==john. 
     * @returns {boolean}
     */
    static validate(str) {
        return new RegExp(`([a-z0-9_]+)(${Filter.operators_regexp_pattern.source})([a-z0-9\-_ ]+)`,'i').test(str);
    }

    /**
     * Parse filter from string or filters from list of strings.
     * The strings pattern must be (field)(operator)(value), i. e., as example: name==john.
     * In (value) empty spaces will be considered, be careful.
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
     * contains (*=)
     * 
     * @param {(String|Array<String>)} source The string or list of strings that will be parsed
     * @returns {Object{recognizedFilter: Filter, invalidFilter: String}} Object with keys `recognizedFilter` or `invalidFilter` to only a string argument or `recognizedFilters` and `invalidFilters` to list of strings input
     */
    static from(source) {
        var filter, field, value, operator;
        if(Array.isArray(source)) {
            var r = [],f = [];
            for (var i = 0; i < source.length; i++) {
                if(Filter.validate(source[i])) {
                    filter = source[i].replace(Filter.operators_regexp_pattern,'+|+$&+|+');
                    [field,operator,value] = filter.split('+|+');
                    r.push(new Filter(field.trim(),operator,value));
                } else {
                    f.push(source[i]);
                }
            }
            return {recognizedFilters: r, invalidFilters: f};
        } else {
            if(Filter.validate(source)) {
                filter = source.replace(Filter.operators_regexp_pattern,'+|+$&+|+');
                [field,operator,value] = filter.split('+|+');
                return {recognizedFilter: new Filter(field,operator,value)};
            } else {
                return {invalidFilter: source};
            }
        }
    }
}