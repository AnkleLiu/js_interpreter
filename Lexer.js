/**
 * Lexer。返回 Token
 */
const { Token } = require('./Token.js')
const { TokenType } = require('./TokenType.js')

const KEY_WORDS = {
    'fn': TokenType.FUNCTION,
    'let': TokenType.LET,
    'if': TokenType.IF,
    'else': TokenType.ELSE,
    'true': TokenType.TRUE,
    'false': TokenType.FALSE,
    'return': TokenType.RETURN,
}

class Lexer {
    constructor(code, position, readPosition, currentChar) {
        // 程序代码
        this.code = code
        // 当前下标位置
        this.position = position
        // 下一个位置
        this.readPosition = readPosition
        // 当前字符，即 position 所指字符
        this.currentChar = currentChar
    }

    static new(code) {        
        return new this(code, 0, 1, code[0])
    }

    readChar() {
        if(this.readPosition >= this.code.length) {
            // 用 null 来指定到末尾了
            this.currentChar = null
        } else {
            this.currentChar = this.code[this.readPosition]
        }
        this.position = this.readPosition
        this.readPosition += 1
    }

    peek() {
        const length = this.code.length
        if(this.readPosition >= length) {
            return null
        }

        return this.code[this.readPosition]
    }

    getNextToken() {
        this.skipWhitespace()
        const c = this.currentChar
        let t = Token.new()
        switch(c) {
            case '=':
                // 判断是赋值还是相等
                if(this.peek() === '=') {
                    this.readChar()
                    t.setTypeAndVal(TokenType.EQ, `${c}${this.currentChar}`)
                } else {
                    t.setTypeAndVal(TokenType.ASSIGN, c)
                }
                break
            case '+':
                t.setTypeAndVal(TokenType.PLUS, c)
                break
            case '-':
                t.setTypeAndVal(TokenType.MINUS, c)
                break
            case '!':
                // 取反还是不等于
                if(this.peek() === '=') {
                    this.readChar()
                    t.setTypeAndVal(TokenType.NOT_EQ, `${c}${this.currentChar}`)
                } else {
                    t.setTypeAndVal(TokenType.BANG, c)
                }
                break
            case '*':
                t.setTypeAndVal(TokenType.ASTERISK, c)
                break
            case '/':
                t.setTypeAndVal(TokenType.SLASH, c)
                break
            case '<':
                t.setTypeAndVal(TokenType.LT, c)
                break
            case '>':
                t.setTypeAndVal(TokenType.GT, c)
                break
            case '(':
                t.setTypeAndVal(TokenType.LPAREN, c)
                break
            case ')':
                t.setTypeAndVal(TokenType.RPAREN, c)
                break
            case '{':
                t.setTypeAndVal(TokenType.LBRACE, c)
                break
            case '}':
                t.setTypeAndVal(TokenType.RBRACE, c)
                break
            case ',':
                t.setTypeAndVal(TokenType.COMMA, c)
                break
            case ';':
                t.setTypeAndVal(TokenType.SEMICOLON, c)
                break
            case null:
                t.setTypeAndVal(TokenType.EOF, null)
                break
            default:
                if(this.isLetter(c)) {
                    const val = this.readIdentifier()
                    const type = this.lookupIdent(val)
                    t.setTypeAndVal(type, val)                    
                } else if(this.isDigit(c)) {
                    const val = this.readNumber()
                    t.setTypeAndVal(TokenType.INT, val)
                } else {
                    t.setTypeAndVal(TokenType.ILLEGAL, c)
                }
                // 需要在这里返回，否则后面的 switch 会跳过一个字符
                return t
        }
        
        this.readChar()
        return t
    }

    isLetter(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
    }

    readIdentifier() {
        const startPosition = this.position        
        while(this.isLetter(this.currentChar)) {            
            this.readChar()
        }
        const endPosition = this.position
        const val = this.code.slice(startPosition, endPosition)
        return val
    }

    lookupIdent(val) {
        if(KEY_WORDS[val] !== undefined) {
            return KEY_WORDS[val]
        }
        return TokenType.IDENT
    }

    isDigit(c) {
        const t = `0123456789`
        return t.indexOf(c) !== -1
    }

    readNumber() {
        const startPosition = this.position
        while(this.isDigit(this.currentChar)) {
            this.readChar()
        }
        const endPosition = this.position
        const val = this.code.slice(startPosition, endPosition)
        
        return this.toInt(val)
    }

    toInt(input) {
        // 字符串转整数，只支持整数
        const t = '0123456789'
        let result = 0
        for(let i = 0; i < input.length; i += 1) {
            const m = t.indexOf(input[i])
            result = result * 10 + m
        }

        return result
    }

    skipWhitespace() {
        while (this.currentChar === ' ' || this.currentChar === '\t' || this.currentChar === '\n' 
                || this.currentChar === '\r' || this.currentChar === '\r\n') {
            this.readChar()
        }
    }

}

const test1 = () => {
    // 人肉比对
    console.log('test1');
    const code = `=+(){},;`
    const lexer = Lexer.new(code)
    for(let i = 0; i < 15; i++) {
        console.log(lexer.getNextToken())
    }
}

const test2 = () => {
    // 人肉比对
    console.log('test2');
    const code = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        
        let result = add(five, ten);
    `
    // const code = `
    //     let five = 5;
    //     let ten = 10;
    // `
    const lexer = Lexer.new(code)
    for(let i = 0; i < 60; i++) {
        console.log(lexer.getNextToken())
    }
}

const test3 = () => {
    // 人肉比对
    console.log('test3');
    const code = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;
    `
    const lexer = Lexer.new(code)
    for(let i = 0; i < 60; i++) {
        console.log(lexer.getNextToken())
    }
}

const test4 = () => {
    // 人肉比对
    console.log('test4');
    const code = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;

        if (5 < 10) {
            return true;
        } else {
            return false;
        }
    `
    const lexer = Lexer.new(code)
    for(let i = 0; i < 80; i++) {
        console.log(lexer.getNextToken())
    }
}

const test5 = () => {
    // 人肉比对
    console.log('test5');
    const code = `
        let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;

        if (5 < 10) {
            return true;
        } else {
            return false;
        }

        10 == 10;
        10 != 9;
    `    
    // "foobar"; 
    // "foo bar";     
    // ""
    // [1, 2];
    // {"foo": "bar"}

    const lexer = Lexer.new(code)
    for(let i = 0; i < 80; i++) {
        console.log(lexer.getNextToken())
    }
}

function main() {
    console.log('main');
    test5()
}


// main()


module.exports = {
    Lexer,
}