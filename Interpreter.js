const { TokenType } = require('./TokenType.js')
const { Lexer } = require('./Lexer')
const { Parser } = require('./Parser')
const { log } = require('./Utils.js')
const { IntegerType, BooleanType, NullType } = require('./Object.js')

const BOOL_POOL = {
    'true': BooleanType.new(TokenType.TRUE),
    'false': BooleanType.new(TokenType.FALSE),
}

class Interpreter {
    constructor(ast) {
        this.ast = ast
    }

    static new(ast) {
        return new this(ast)
    }

    monkeyEval(astNode) {        
        console.log('astNode 类型', astNode.constructor.name);
        const rootNodeType = astNode.constructor.name
        let tempVal, left, right
        switch(rootNodeType) {
            case 'ProgramNode':
                log('ProgramNode 类型')
                return this.evalStatements(astNode.statements)
            case 'ExpressionStatementNode':
                log('ExpressionStatementNode 类型')
                return this.monkeyEval(astNode.expression)
            case 'IntegerNode':
                log('IntegerNode 类型')
                return IntegerType.new(astNode.value)
            case 'BoolNode':
                log('BoolNode 类型', astNode)
                return BOOL_POOL[astNode.value]
            case 'PrefixNode':
                log('PrefixNode 类型')
                tempVal = this.monkeyEval(astNode.right)
                log('tempVal', tempVal)
                return this.evalPrefixExpr(astNode.op, tempVal)
            case 'InfixNode':
                log('InfixNode 类型', astNode)
                left = this.monkeyEval(astNode.left)
                right = this.monkeyEval(astNode.right)
                return this.evalInfixExpr(astNode.op, left, right)
            case 'IfNode':
                log('IfNode', astNode)
                return this.evalIfExpression(astNode)
            case 'BlockNode':
                log('BlockNode')
                return this.evalStatements(astNode.statements)
            default:
                log('没找到')
                return NullType.new(astNode.value)
        }
    }

    evalStatements(statements) {
        log('evalStatements')
        for(const stmt of statements) {
            return this.monkeyEval(stmt)
        }
        return NullType.new(null)
    }

    evalPrefixExpr(op, val) {
        log('op', op)
        switch(op) {
            case '!':
                log('是感叹号')
                return this.evalBangExpr(val)
            case '-':
                log('是负数')
                return this.evalMinusPrefixExpr(val)
            default:
                log('暂时不支持')
                return null
        }
    }

    evalBangExpr(input) {
        const val = input.value
        switch(val) {
            case 'TRUE':
                return BOOL_POOL['false']
            case 'FALSE':
                return BOOL_POOL['true']
            case 'NULL':
                return BOOL_POOL['true']
            default:
                return BOOL_POOL['false']                
        }
    }

    evalMinusPrefixExpr(input) {
        // 目前只能是整数
        return IntegerType.new(Number(input.value)*(-1))
    }

    evalInfixExpr(op, left, right) {
        // log('op', op, 'left', left, 'right', right)
        if(left.constructor.name === 'IntegerType' && right.constructor.name === 'IntegerType') {
            return this.evalIntegerInfixExpr(op, left, right)
        }

        // 这里应该是 js 内置的判断相等，不了解原理
        if(op === '==') {
            log('left', left, 'right', right)
            return BOOL_POOL[left == right]
        } else if(op === '!=') {
            return BOOL_POOL[left !== right]
        }
        
        return null
    }

    evalIntegerInfixExpr(op, left, right) {
        const a = left.value
        const b = right.value

        switch(op) {
            case '+':
                return IntegerType.new(a + b)
            case '-':
                return IntegerType.new(a - b)
            case '*':
                return IntegerType.new(a * b)
            case '/':
                return IntegerType.new(a / b)
            case '<':
                return BOOL_POOL[a < b]
            case '>':
                return BOOL_POOL[a > b]
            case '==':
                return BOOL_POOL[a == b]
            case '!=':
                return BOOL_POOL[a != b]
            default:
                return NullType.new(null)
        }
    }

    evalIfExpression(astNode) {
        log('evalIfExpr')
        const condition = astNode.condition
        const conditionValue = this.monkeyEval(condition)
        log('conditionVal', conditionValue)
        if(this.isTruthy(conditionValue)) {
            return this.monkeyEval(astNode.consequence)
        } else {
            return this.monkeyEval(astNode.alternative)
        }
    }

    isTruthy(expr) {
        if(expr.value === 'TRUE') {
            return true
        }

        return false
    }

}

function main() {
    log('main in interpreter')
    // 整数求值测试：5, 10
    // 布尔值测试求值：true, false
    const code = `if(2 == 1){ 10 } else { 9 }`
    const lexer = Lexer.new(code)
    const parser = Parser.new(lexer)
    const ast = parser.parseProgram()

    const interpreter = Interpreter.new(ast)
    const result = interpreter.monkeyEval(ast)

    log('result\n', result)
}


main()


module.exports = {
    Interpreter,
}