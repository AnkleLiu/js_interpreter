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

class FunctionType extends ValueType {
    constructor(params, body, env) {
        super()
        this.params = params
        this.body = body
        this.env = env
    }

    static new(params, body, env) {
        return new this(params, body, env)
    }
}

class ErrorType extends ValueType {
    constructor(msg) {
        super()
        this.type = ObjectType.ERROR_OBJ
        this.msg = msg
    }

    static new(msg) {
        return new this(msg)
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

// 环境
class Environment {
    constructor() {
        this.env = {}
        this.outer = null
    }

    static new() {
        return new this()
    }

    get(name) {
        const v = this.env[name]
        if(v === undefined) {
            return this.outer.get(name)
        }
        return v
    }

    set(name, value) {
        this.env[name] = value
    }

    setEnclosingEnv(outer) {
        this.outer = outer
    }
}

module.exports = {
    IntegerType,
    BooleanType,
    ReturnValueType,
    FunctionType,
    ErrorType,
    NullType,
    Environment,
}