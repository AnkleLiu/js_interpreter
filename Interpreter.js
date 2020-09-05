const { TokenType } = require('./TokenType.js')
const { Lexer } = require('./Lexer')
const { Parser } = require('./Parser')
const { log } = require('./Utils.js')

class Interpreter {
    constructor(ast) {
        this.ast = ast
    }

    static new(ast) {
        return new this(ast)
    }

    monkeyEval(astNode) {
        console.log('monkeyEval', astNode.token.type);
        const rootNodeType = astNode.token.type
        switch(rootNodeType) {
            case TokenType.PROGRAM:
                log('eval program')
                return this.evalStatements(astNode.statements)
            case TokenType.EXPRESSION_STATEMENT:
                log('eval EXPRESSION_STATEMENT')                
                return this.monkeyEval(astNode.expression)
            case TokenType.INT:
                log('eval int')                
                return 1
            default:
                log('没找到')
        }
    }

    evalStatements(statements) {
        log('evalStatements', statements[0].token.type === TokenType.EXPRESSION_STATEMENT)
        for(const stmt of statements) {
            return this.monkeyEval(stmt)
        }
        // return null
    }
}

function main() {
    log('main in interpreter')

    const code = `5`
    const lexer = Lexer.new(code)
    const parser = Parser.new(lexer)
    const ast = parser.parseProgram()

    const interpreter = Interpreter.new(ast)
    const result = interpreter.monkeyEval(ast)

    log('result\n', result)
}


main()