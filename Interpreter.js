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
        // TODO。这里还是要改成 constructor.name ，
        console.log('monkeyEval', astNode.token.type);
        const rootNodeType = astNode.token.type
        let tempVal
        switch(rootNodeType) {
            case TokenType.PROGRAM:
                log('eval program')
                return this.evalStatements(astNode.statements)
            case TokenType.EXPRESSION_STATEMENT:
                log('eval EXPRESSION_STATEMENT')                
                return this.monkeyEval(astNode.expression)
            case TokenType.INT:
                log('eval int', astNode)
                return IntegerType.new(astNode.value)
            case TokenType.TRUE:
            case TokenType.FALSE:
                // TODO。这里写的不好，应该有一个 boolean 类型
                log('eval bool', astNode)
                return BOOL_POOL[astNode.value]
            case TokenType.BANG:
                // TODO。这里能不能把 prefix 统一起来，又是 bang 又是 - 的
                log('eval bang', astNode)
                tempVal = this.monkeyEval(astNode.right)
                log('取反值', tempVal)
                return this.evalPrefixExpr(astNode.op, tempVal)
            case TokenType.MINUS:                
                log('eval minus', astNode)
                tempVal = this.monkeyEval(astNode.right)
                log('负数', tempVal)
                return this.evalPrefixExpr(astNode.op, tempVal)
            default:
                log('没找到')
                return NullType.new(astNode.value)
        }
    }

    evalStatements(statements) {
        log('evalStatements', statements[0].token.type === TokenType.EXPRESSION_STATEMENT)
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
}

function main() {
    log('main in interpreter')
    // 整数求值测试：5, 10
    // 布尔值测试求值：true, false
    const code = `--6`
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