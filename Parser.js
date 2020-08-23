const { ProgramNode, LetNode, IdentNode, } = require('./AstNode')
const { TokenType } = require('./TokenType')
const { Lexer } = require('./Lexer')


class Parser {
    constructor(lexer) {
        this.lexer = lexer
        this.currentToken = this.lexer.getNextToken()
        this.peekToken = this.lexer.getNextToken()
    }

    static new(lexer) {
        return new this(lexer)
    }

    getNextToken() {
        this.currentToken = this.peekToken
        this.peekToken = this.lexer.getNextToken()
    }

    parseProgram() {
        // 起点
        const programNode = ProgramNode.new()
        while(this.currentToken.type !== TokenType.EOF) {
            const stmt = this.parseStatement(this.currentToken)            
            if(stmt !== null) {
                programNode.appendStatement(stmt)
            }
            this.getNextToken()            
        }
        return programNode
    }

    parseStatement(token) {
        switch(token.type) {
            case TokenType.LET:
                return this.parseLetStatement(token)
            default:
                console.log('default', token);
                return token
        }
    }

    parseLetStatement(token) {
        // 当前只是 let x = 5; 这样的
        const letNode = LetNode.new()
        
        // 下个 token 是 标识符，IdentNode
        if(!this.peekTokenIs(TokenType.IDENT)) {
            return null
        }

        this.getNextToken()
        const identNode = IdentNode.new(token.value)
        letNode.name = identNode

        // 下个 token 是 =
        if(!this.peekTokenIs(TokenType.ASSIGN)) {
            return null
        }

        // 调用一次，currentToken 是 =
        // 我们暂时跳过数字
        this.getNextToken()
        while(!this.currentTokenIs(TokenType.SEMICOLON)) {
            this.getNextToken()
        }

        // 这样 currentToken 是 SEMICOLON，
        // 返回到 parseProgram，继续调用 getNextToken() 就跳过了这个分号
        console.log('letNode\n', letNode)
        return letNode
    }

    peekTokenIs(tokenType) {
        // 还有个 expectPeekToken，会调用 getNextToken我觉得暂时用这个挺好的，就先不写了，
        return this.peekToken.type === tokenType
    }

    currentTokenIs(tokenType) {
        return this.currentToken.type === tokenType
    }
}


function main() {
    const code = `let x = 5;`
    const lexer = Lexer.new(code)
    const parser = Parser.new(lexer)
    const r = parser.parseProgram()
    console.log('result\n', r);
    // for(let i = 0; i < 80; i++) {
    //     console.log(lexer.getNextToken())
    // }
}


main()
