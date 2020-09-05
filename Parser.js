const { 
    ProgramNode, LetNode, IdentNode, IntegerNode, BoolNode,
    PrefixNode, InfixNode, ReturnNode, IfNode, BlockNode, 
    FunctionNode, CallNode,
    ExpressionStatementNode,
} = require('./AstNode')
const { TokenType } = require('./TokenType')
const { Lexer } = require('./Lexer')
const { OperatorPriority } = require('./OperatorPriority')


const precedences = {
    [TokenType.EQ]: OperatorPriority.EQUALS,
    [TokenType.NOT_EQ]: OperatorPriority.EQUALS,
    [TokenType.LT]: OperatorPriority.LESSGREATER,
    [TokenType.GT]: OperatorPriority.LESSGREATER,
    [TokenType.PLUS]: OperatorPriority.SUM,
    [TokenType.MINUS]: OperatorPriority.SUM,
    [TokenType.SLASH]: OperatorPriority.PRODUCT,
    [TokenType.ASTERISK]: OperatorPriority.PRODUCT,
    [TokenType.LPAREN]: OperatorPriority.CALL,
}


class Parser {
    constructor(lexer) {
        this.lexer = lexer
        this.currentToken = this.lexer.getNextToken()
        this.peekToken = this.lexer.getNextToken()

        this.prefixParseFns = {}
        this.infixParseFns = {}

        this.registerPrefixFn(TokenType.IDENT, this.parseIdent)
        this.registerPrefixFn(TokenType.INT, this.parseInteger)
        this.registerPrefixFn(TokenType.BANG, this.parsePrefixExpression)
        this.registerPrefixFn(TokenType.MINUS, this.parsePrefixExpression)
        this.registerPrefixFn(TokenType.TRUE, this.parseBoolean)
        this.registerPrefixFn(TokenType.FALSE, this.parseBoolean)
        this.registerPrefixFn(TokenType.LPAREN, this.parseGroupedExpression)
        this.registerPrefixFn(TokenType.IF, this.parseIfExpression)
        this.registerPrefixFn(TokenType.FUNCTION, this.parseFunctionLiteral)

        this.registerInfixFn(TokenType.PLUS, this.parseInfixExpression)
        this.registerInfixFn(TokenType.MINUS, this.parseInfixExpression)
        this.registerInfixFn(TokenType.SLASH, this.parseInfixExpression)
        this.registerInfixFn(TokenType.ASTERISK, this.parseInfixExpression)
        this.registerInfixFn(TokenType.EQ, this.parseInfixExpression)
        this.registerInfixFn(TokenType.NOT_EQ, this.parseInfixExpression)
        this.registerInfixFn(TokenType.LT, this.parseInfixExpression)
        this.registerInfixFn(TokenType.GT, this.parseInfixExpression)
        this.registerInfixFn(TokenType.LPAREN, this.parseCallExpression)

        this.errors = []
    }

    static new(lexer) {
        return new this(lexer)
    }

    registerPrefixFn(tokenType, parseFn) {
        this.prefixParseFns[tokenType] = parseFn
    }

    registerInfixFn(tokenType, parseFn) {
        this.infixParseFns[tokenType] = parseFn
    }

    noPrefixParseFnError() {
        console.log('no prefix parse function found', this.currentToken)
        this.errors.push('no prefix parse function found')
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
            case TokenType.RETURN:
                return this.parseReturnStatement()
            default:
                // console.log('default', token);
                return this.parseExpressionStatement()
        }
    }

    parseLetStatement(token) {
        const letNode = LetNode.new()
        
        // 下个 token 是 标识符，IdentNode
        if(!this.peekTokenIs(TokenType.IDENT)) {
            return null
        }

        this.getNextToken()
        const identNode = IdentNode.new(this.currentToken.value)        
        letNode.name = identNode

        // 下个 token 是 =
        if(!this.peekTokenIs(TokenType.ASSIGN)) {
            return null
        }

        // 调用一次，currentToken 是 =
        // 我们暂时跳过表达式的 parse
        this.getNextToken()
        this.getNextToken()
        const value = this.parseExpression(OperatorPriority.LOWEST)
        letNode.value = value
        
        if(this.peekTokenIs(TokenType.SEMICOLON)) {
            this.getNextToken()
        }

        // 这样 currentToken 是 SEMICOLON，
        // 返回到 parseProgram，继续调用 getNextToken() 就跳过了这个分号
        // console.log('letNode\n', letNode)
        return letNode
    }

    parseReturnStatement() {
        this.getNextToken()

        const value = this.parseExpression(OperatorPriority.LOWEST)
        const stmt = ReturnNode.new(value)

        // 暂时跳过 parse expression
        if(this.peekTokenIs(TokenType.SEMICOLON)) {
            this.getNextToken()
        }

        return stmt
    }

    parseExpressionStatement() {
        // 这个方法里不调用 getNextToken        
        const expressionNode = this.parseExpression(OperatorPriority.LOWEST)
        const stmt = ExpressionStatementNode.new(expressionNode)

        if(this.peekTokenIs(TokenType.SEMICOLON)) {
            this.getNextToken()
        }

        return stmt
    }

    // 主要就靠这个方法撑着
    parseExpression(precedence) {
        const prefixFn = this.prefixParseFns[this.currentToken.type]
        if(prefixFn === undefined) {
            this.noPrefixParseFnError()
            return null
        }
        let leftExp = prefixFn.call(this)

        while(!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infixFn = this.infixParseFns[this.peekToken.type]
            if(infixFn === undefined) {
                return leftExp
            }

            this.getNextToken()

            leftExp = infixFn.call(this, leftExp)
        }
        
        return leftExp
    }

    parseIdent() {
        const node = IdentNode.new(this.currentToken.value)
        return node
    }

    parseInteger() {
        // 这里仍然没有调用 getNextToken
        const num = Number(this.currentToken.value)
        const node = IntegerNode.new(num)
        return node
    }

    parsePrefixExpression() {
        const token = this.currentToken
        const op = this.currentToken.value
        this.getNextToken()
        const expression = this.parseExpression(OperatorPriority.PREFIX)

        const node = PrefixNode.new(token, op, expression)

        return node
    }

    parseInfixExpression(leftExp) {
        const op = this.currentToken.value
        const precedence = this.currentPrecedence()
        this.getNextToken()
        const rightExp = this.parseExpression(precedence)
        
        const node = InfixNode.new(this.currentToken, leftExp, op, rightExp)

        return node
    }

    parseGroupedExpression() {
        this.getNextToken()
        const exp = this.parseExpression(OperatorPriority.LOWEST)
        // 如果需要用 expectPeekToken，那么这里要替换
        this.getNextToken()
        if(!this.currentTokenIs(TokenType.RPAREN)) {
            return null
        }

        return exp
    }

    parseIfExpression() {
        const curToken = this.currentToken
        // 应该就是 if 吧
        console.log('curToken in if', curToken);
        this.getNextToken()
        if(!this.currentTokenIs(TokenType.LPAREN)) {
            return null
        }

        this.getNextToken()
        const condition = this.parseExpression(OperatorPriority.LOWEST)

        this.getNextToken()
        if(!this.currentTokenIs(TokenType.RPAREN)) {
            return null
        }

        this.getNextToken()
        if(!this.currentTokenIs(TokenType.LBRACE)) {
            return null
        }

        const consequence = this.parseBlockStatement()

        // 判断下有没有 else
        let alternative = null
        if(this.peekTokenIs(TokenType.ELSE)) {
            // 跳过 else
            this.getNextToken()
            // 跳过 左大括号
            this.getNextToken()
            if(!this.currentTokenIs(TokenType.LBRACE)) {
                return null
            }

            alternative = this.parseBlockStatement()                        
        }

        const node = IfNode.new(condition, consequence, alternative)

        return node
    }

    parseBlockStatement() {
        // curToken 是 {
        const curToken = this.currentToken
        console.log('curToken in block', curToken);
        const statements = []
        this.getNextToken()
        // console.log('after get next in block', this.currentToken);
        while(!this.currentTokenIs(TokenType.RBRACE) && !this.currentTokenIs(TokenType.EOF)) {
            const stmt = this.parseStatement(this.currentToken)
            console.log('block stmt', stmt);
            if(stmt !== null) {
                statements.push(stmt)
            }
            this.getNextToken()
        }
        console.log('statements', statements);
        const node = BlockNode.new(statements)

        return node
    }

    parseFunctionLiteral() {
        // console.log('parse function literal', this.currentToken);
        this.getNextToken()
        if(!this.currentTokenIs(TokenType.LPAREN)) {
            return null
        }

        const parameters = this.parseFunctionParameters()
        
        if(!this.currentTokenIs(TokenType.LBRACE)) {            
            return null
        }
        const body = this.parseBlockStatement()

        const node = FunctionNode.new(parameters, body)

        return node
    }

    parseFunctionParameters() {
        // console.log('parseFunctionParameters', this.currentToken);
        const params = []
        // 跳过 左括号
        this.getNextToken()

        while(!this.peekTokenIs(TokenType.RPAREN)) {
            // 一个 token 一个 ,
            const identNode = IdentNode.new(this.currentToken.value)
            params.push(identNode)            
            this.getNextToken()
            this.getNextToken()
        }

        // 把最后一个参数加上
        const identNode = IdentNode.new(this.currentToken.value)
        params.push(identNode)
        
        // 跳过 右括号
        this.getNextToken()
        this.getNextToken()

        console.log('参数列表', params);
        return params
    }

    parseCallExpression(funExp) {
        // 这个 funExp 就是优先级函数里面的 leftExp
        console.log('parseCallExpression', funExp, this.currentToken);
        const args = this.parseCallArguments()
        console.log('函数调用实参列表', args);

        const node = CallNode.new(funExp, args)

        return node
    }

    parseCallArguments() {
        // currentToken 是左括号
        console.log('parseCallArguments', this.currentToken);
        const args = []
        
        // 第一个实参
        this.getNextToken()
        if(this.currentTokenIs(TokenType.RPAREN)) {
            return args
        }
        args.push(this.parseExpression(OperatorPriority.LOWEST))

        while(this.peekTokenIs(TokenType.COMMA)) {            
            this.getNextToken()
            this.getNextToken()
            args.push(this.parseExpression(OperatorPriority.LOWEST))
        }

        // 理论上应该是右括号
        this.getNextToken()
        if(!this.currentTokenIs(TokenType.RPAREN)) {
            return null
        }

        return args
    }

    parseBoolean() {
        const node = BoolNode.new(this.currentToken, this.currentToken.value)
        return node
    }

    peekTokenIs(tokenType) {
        // 还有个 expectPeekToken，会调用 getNextToken我觉得暂时用这个挺好的，就先不写了，
        return this.peekToken.type === tokenType
    }

    currentTokenIs(tokenType) {
        return this.currentToken.type === tokenType
    }

    peekPrecedence() {
        const p = precedences[this.peekToken.type]
        if(p === undefined) {
            return OperatorPriority.LOWEST
        }

        return p
    }

    currentPrecedence() {
        const p = precedences[this.currentToken.type]
        if(p === undefined) {
            return OperatorPriority.LOWEST
        }

        return p
    }
}

function testParseFn() {
    const codes = [`fn(x, y){ x + y; };`, `fn(x){};`, `fn(x, y, z){};` ]
    // TODO。
}

function testParseFunCall() {
    const codes = [`add(1, 2 * 3, 4 + 5);`, `add(2, 3);`, `call(2, 3, fn(x, y){x + y;});` ]
    // TODO。
}

function testParseLetStmt() {
    const codes = [`let x = 5;`, `let x = 5 + 1`, `call(2, 3, fn(x, y){x + y;});` ]
    // TODO。
}

function testParseReturnStmt() {
    const codes = [`return 5;`, `let x = 5 + 1`, `call(2, 3, fn(x, y){x + y;});` ]
    // TODO。
}

function main() {
    const code = `let x = 5;`
    const lexer = Lexer.new(code)
    const parser = Parser.new(lexer)
    const r = parser.parseProgram()
    console.log('statements\n', r.statements[0]);

    // 校验一个 let 语句
    const stmt = r.statements[0]
    console.log(stmt.constructor.name)
    console.log(stmt.name)
    console.log(stmt.value)

}


// main()


module.exports = {
    Parser
}