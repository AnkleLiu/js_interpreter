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
        this.token = Token.new(TokenType.PROGRAM, 'Program')
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

// 整数，属于 ExpressionNode，因为可以计算出数值来
class IntegerNode extends ExpressionNode {
    constructor(value) {
        super()
        this.token = Token.new(TokenType.INT, value)
        this.value = value
    }

    static new(value) {
        return new this(value)
    }
}

// 布尔
class BoolNode extends ExpressionNode {
    constructor(token, value) {
        super()
        this.token = token
        this.value = value
    }

    static new(token, value) {
        return new this(token, value)
    }
}

// 前缀表达式
class PrefixNode extends ExpressionNode {
    constructor(token, op, right) {
        // right 也是一个 ExpressionNode 类型
        super()
        this.token = token
        this.op = op
        this.right = right
    }

    static new(token, op, right) {
        return new this(token, op, right)
    }
}

// 中缀表达式
class InfixNode extends ExpressionNode {
    constructor(token, left, op, right) {
        // right 也是一个 ExpressionNode 类型
        super()
        this.token = token
        this.left = left
        this.op = op
        this.right = right
    }

    static new(token, left, op, right) {
        return new this(token, left, op, right)
    }
}

// return 语句
class ReturnNode extends StatementNode {
    // returnValue 是 ExpressionNode 类型
    constructor(returnValue) {
        super()
        this.token = Token.new(TokenType.RETURN, 'return')
        this.returnValue = returnValue
    }

    static new(returnValue) {
        return new this(returnValue)
    }

    tokenLiteral() {
        return `ReturnNode<${this.token}, ${this.returnValue}>`
    }
}

// if
class IfNode extends ExpressionNode {
    constructor(condition, consequence, alternative) {
        super()
        this.token = Token.new(TokenType.IF, 'if')
        this.condition = condition
        this.consequence = consequence
        this.alternative = alternative
    }

    static new(condition, consequence, alternative) {
        return new this(condition, consequence, alternative)
    }
}

// block，{} 包围的
class BlockNode extends StatementNode {
    constructor(statements) {
        super()
        this.token = Token.new(TokenType.LBRACE, '{')
        this.statements = statements
    }

    static new(statements) {
        return new this(statements)
    }
}

// 函数定义，fn(x, y) { return x > y; }
class FunctionNode extends ExpressionNode {
    constructor(parameters, body) {
        // parameters 是 ident 数组，body 是 BlockStatement
        super()
        this.token = Token.new(TokenType.FUNCTION, 'fn')
        this.parameters = parameters
        this.body = body
    }
    static new(parameters, body) {
        return new this(parameters, body)
    }
}

// 函数调用。
class CallNode extends ExpressionNode {
    constructor(funExp, args) {
        super()
        this.token = Token.new(TokenType.LPAREN, '(')
        this.funExp = funExp
        this.args = args
    }

    static new(funExp, args) {
        return new this(funExp, args)
    }
}

// 单独加了一个 ExpressionStatement，例如 x + 10; 这样的语句
class ExpressionStatementNode extends Node {
    constructor(expression) {
        // 这个 token 是表达式的第一个，例如 x + 10; 那么就是 Token.IDENT
        // expression 就是 ExpressionNode
        // TODO。改一下这个 token，单独加一个 ExpressionStatement，为了 eval 用 TokenType 做 switch 操作
        super()
        this.token = Token.new(TokenType.EXPRESSION_STATEMENT, TokenType.EXPRESSION_STATEMENT)
        this.expression = expression
    }

    static new(expression) {
        return new this(expression)
    }

    statementNode() {

    }

    tokenLiteral() {

    }
}


module.exports = {
    ProgramNode,
    LetNode,
    IdentNode,
    IntegerNode,
    BoolNode,
    PrefixNode,
    InfixNode,
    ReturnNode,
    IfNode,
    BlockNode,
    FunctionNode,
    CallNode,
    ExpressionStatementNode,
}