const util = require('util');
// const { TokenType } = require('./TokenType.js')


class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
    
    static new(type, value) {
        return new this(type, value)
    }

    setTypeAndVal(type, value) {
        this.type = type
        this.value = value
    }

    // 覆盖 toString 方法
    [util.inspect.custom](depth, options) {
        return `Token<${this.type}, ${this.value}>`
    }
}

// function main() {
//     const t = Token.new(TokenType.ILLEGAL, TokenType.ILLEGAL)
//     console.log('main', t)
// }

// main()

module.exports = {
    Token,
}