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

class StringType extends ValueType {
    constructor(value) {
        super()
        this.type = ObjectType.STRING_OBJ
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

class ArrayType extends ValueType {
    constructor(elements) {
        super()
        this.elements = elements
    }

    static new(elements) {
        return new this(elements)
    }
}

// 原书有一个 HashType 对象作为 key，这里偷懒就用 js 的字符串都 key 值
class HashType extends ValueType {
    constructor(pairs) {
        super()
        this.pairs = pairs
    }

    static new(pairs) {
        return new this(pairs)
    }
}

class BuiltinType extends ValueType {
    constructor(fnName, impl) {
        super()
        this.fnName = fnName
        this.impl = impl
    }

    static new(fnName, impl) {
        return new this(fnName, impl)
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
        if(v === undefined && this.outer !== null) {
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
    StringType,
    BuiltinType,
    ReturnValueType,
    FunctionType,
    ArrayType,
    HashType,
    ErrorType,
    NullType,
    Environment,
}