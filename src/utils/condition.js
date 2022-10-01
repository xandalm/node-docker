
class Operator {
    toString() {
        return this.constructor.value;
    }
}

class RelationalOperator extends Operator {
    static operators = ['==','!=','>=','<=','^=','$=','*=','>','<'];
    static regexp_pattern = new RegExp(RelationalOperator.operators.join('|').replace(/[\^\$\*\!]/g,'\\$&'));
}

class LogicalOperator extends Operator {
    static operators = ['and','or'];
    static regexp_pattern = new RegExp('^(and|or)$');
}

class LogicalOperatorAnd extends LogicalOperator {
    static value = 'and';
}

class LogicalOperatorOr extends LogicalOperator {
    static value = 'or';
}

class RelationalOperatorEqual extends RelationalOperator {
    static value = '==';
}

class RelationalOperatorNonEqual extends RelationalOperator {
    static value = '!=';
}

class RelationalOperatorBigger extends RelationalOperator {
    static value = '>';
}

class RelationalOperatorBiggerOrEqual extends RelationalOperator {
    static value = '>=';
}

class RelationalOperatorLess extends RelationalOperator {
    static value = '<';
}

class RelationalOperatorLessOrEqual extends RelationalOperator {
    static value = '<=';
}

class RelationalOperatorStartWith extends RelationalOperator {
    static value = '^=';
}

class RelationalOperatorEndWith extends RelationalOperator {
    static value = '$=';
}

class RelationalOperatorContains extends RelationalOperator {
    static value = '*=';
}

class RelationalOperatorFactory {
    
    static #check(source) {
        var _class;
        switch (source) {
            case RelationalOperatorContains.value: _class = RelationalOperatorContains; break;
            case RelationalOperatorEqual.value: _class = RelationalOperatorEqual; break;
            case RelationalOperatorNonEqual.value: _class = RelationalOperatorNonEqual; break;
            case RelationalOperatorBigger.value: _class = RelationalOperatorBigger; break;
            case RelationalOperatorBiggerOrEqual.value: _class = RelationalOperatorBiggerOrEqual; break;
            case RelationalOperatorLess.value: _class = RelationalOperatorLess; break;
            case RelationalOperatorLessOrEqual.value: _class = RelationalOperatorLessOrEqual; break;
            case RelationalOperatorStartWith.value: _class = RelationalOperatorStartWith; break;
            default: _class = RelationalOperatorEndWith;
        }
        return new _class(source);
    }

    static from(source) {
        if(typeof source === 'string')
            return RelationalOperatorFactory.#check(source);
        throw new TypeError("Invalid to parse");
    }
}

/**
 * Class to represent condition from requests
 */
class Condition {

    // order by length, desc
    static operators = ['==','!=','>=','<=','^=','$=','*=','>','<']
    static operators_regexp_pattern = new RegExp(Condition.operators.join('|').replace(/[\^\$\*\!]/g,'\\$&'))

    static #parseFromJSON(source) {
        var queue = [], res = true;
        var root = [];
        if(Array.isArray(source))
            res = false;
        queue.push([root,source]);
        while(queue.length > 0 && res === true) {
            let [aux,src] = queue.shift();
            if(Array.isArray(src)) {
                src.forEach(e => {
                    if (e.operator) {
                        aux.push(new LogicalCondition(e.operator));
                        queue.push([aux.at(-1).subconditions,e.grouping]);
                    } else {
                        queue.push([aux, e]);
                    }
                });
            } else if(typeof(src) === 'object') {
                if(src.operator) {
                    aux.push(new LogicalCondition(src.operator));
                    queue.push([aux.at(-1).subconditions,src.grouping]);
                } else if(src.condition && typeof(src.condition) === 'string')
                    aux.push(RelationalCondition.from(src.condition));
            } else
                res = false;
        }
        if(!res)
            throw new TypeError("Invalid to parse");
        else
            return root[0];
    }

    /**
     * Parse condition from string or from JSON object.
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
     * 
     * @param {(String|Object)} source The string or list of strings that will be parsed
     * @returns {Condition} Condition object
     */
    static from(source) {
        if(source == undefined)
            return;
        if(typeof source === 'string') {
            try {
                return RelationalCondition.from(source);
            } catch (error) { }
        } else if(typeof(source) === 'object')
            return Condition.#parseFromJSON(source);
        throw new TypeError("Invalid to parse");
    }
}

class RelationalCondition extends Condition {

    /**
     * Create a condition.
     * @param {String} field Relationa condition field.
     * @param {String} operator Relationa condition operator.
     * @param {String|number} value Relationa condition comparable/expected value.
     */
    constructor(field,operator,value) {
        super();
        if(typeof field !== 'string')
            throw new TypeError("The field must be string");
        if(!operator instanceof RelationalOperator)
            throw new TypeError("The operator must be RelationalOperator class instance");
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    /**
     * Check if the string can be a condition.
     * @param {String} str String who represents condition (field)(operator)(value), i. e.: name==john. 
     * @returns {boolean}
     */
    static validate(str) {
        return new RegExp(`([a-z0-9_]+)(${RelationalOperator.regexp_pattern.source})([a-z0-9\-_ ]*)`,'i').test(str);
    }

    static from(src) {
        if(!RelationalCondition.validate(src))
            throw new TypeError("Invalid to parse");
        var condition = src.replace(RelationalOperator.regexp_pattern,'+|+$&+|+');
        var [field,operator,value] = condition.split('+|+');
        operator = RelationalOperatorFactory.from(operator);
        condition = new RelationalCondition(field,operator,value);
        return condition;
    }
}

class LogicalCondition extends Condition {
    
    constructor(operator) {
        super();
        if(!operator instanceof LogicalOperator)
            throw new TypeError("Illegal operator");
        this.operator = operator;
        this.subconditions = [];
    }
}

export {
    Condition,
    RelationalCondition,
    LogicalCondition,
    LogicalOperator,
    LogicalOperatorAnd,
    LogicalOperatorOr,
    RelationalOperatorEqual,
    RelationalOperatorNonEqual,
    RelationalOperatorLess,
    RelationalOperatorLessOrEqual,
    RelationalOperatorBigger,
    RelationalOperatorBiggerOrEqual,
    RelationalOperatorStartWith,
    RelationalOperatorEndWith,
    RelationalOperatorContains
};