
class Order {

    toString() {
        return this.constructor.value;
    }
}

class AscendOrder extends Order {
    static value = 'ASC';
}

class DescendOrder extends Order {
    static value = 'DESC';
}

class OrderFactory {

    static _validate(source) {
        if(/^ASC$/i.test(source))
            return new AscendOrder();
        else if(/^DESC$/i.test(source))
            return new DescendOrder();
        else
            throw new TypeError("Invalid to parse");
    }

    /**
     * Parse order from source
     * @param {string} source 
     * @returns {AscendOrder|DescendOrder}
     */
    static from(source) {
        if(typeof source === 'string')
            return OrderFactory._validate(source);
        throw new TypeError("Invalid to parse");
    }

}

class OrderBy {

    constructor(field, order) {
        if(!order instanceof Order)
            throw new TypeError("Invalid to parse");
        if(typeof(field) !== 'string')
            throw new TypeError("Invalid to parse");
        this.field = field;
        this.order = order;
    }

    static from(source) {
        if(source == undefined)
            return;
        if(typeof(source) === 'string' || Array.isArray(source) || typeof(source) !== 'object')
            throw new TypeError("Invalid to parse");
        else {
            let order = OrderFactory.from(source.order);
            return new OrderBy(source.field,order);
        }
    }

}

export {
    OrderBy
}