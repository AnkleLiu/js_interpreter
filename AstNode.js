/**
 * AST 节点，只有两种，Statement 和 Expression
 */
const { log } = require('./Utils')
const { Token } = require('./Token.js')
const { TokenType } = require('./TokenType.js')


class Node { }

class StatementNode extends Node { }

class ExpressionNode extends Node { }

// 整个 ast 的根节点
class ProgramNode extends Node {
    constructor() {
        super()
        this.statements = []
    }

    static new() {
        return new this()
    }

    appendStatement(stmt) {
        this.statements.push(stmt)
    }

    tokenLiteral() {
        for(s of this.statements) {
            return s.tokenLiteral()
        }
    }
}

// 例如：let x = 5;   token 就是 LET，name 是 IdentNode 类型，value 是 expressionNode
class LetNode extends StatementNode {
    constructor(name, value) {
        super()
        this.token = Token.new(TokenType.LET, 'let')
        this.name = name
        this.value = value
    }

    static new(name, value) {
        return new this(name, value)
    }

    tokenLiteral() {

    }
}

// 标识符。原书把这个作为 ExpressionNode 类型，但是我觉得没必要
class IdentNode extends StatementNode {
    constructor(value) {
        super()
        this.token = Token.new(TokenType.IDENT, value)
        this.value = value
    }

    static new(value) {
        return new this(value)
    }

    tokenLiteral() {
        return `IdentNode<${this.token}, ${this.value}>`
    }
}


module.exports = {
    ProgramNode,
    LetNode,
    IdentNode,
}