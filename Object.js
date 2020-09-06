const { ObjectType } = require('./ObjectType')

/**
 * 值类型
 */
class ValueType {}


class IntegerType extends ValueType {
    constructor(value) {
        super()
        this.type = ObjectType.INTEGER_OBJ
        this.value = value
    }

    static new(value) {
        return new this(value)
    }
}

class BooleanType extends ValueType {
    constructor(value) {
        super()
        this.type = ObjectType.BOOLEAN_OBJ
        this.value = value
    }

    static new(value) {
        return new this(value)
    }
}

class ReturnValueType extends ValueType {
    constructor(value) {
        super()
        this.type = ObjectType.RETURN_VALUE_OBJ
        this.value = value
    }

    static new(value) {
        return new this(value)
    }
}

class NullType extends ValueType {
    constructor(value) {
        super()
        this.type = ObjectType.NULL_OBJ
        this.value = value
    }

    static new(value) {
        return new this(value)
    }
}

module.exports = {
    IntegerType,
    BooleanType,
    ReturnValueType,
    NullType,
}