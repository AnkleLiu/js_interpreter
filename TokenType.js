/**
 * Token 的各种类型
 */

class TokenType {
    // 特殊的，作为 ast 的根节点
    static get PROGRAM() {
        return 'PROGRAM'
    }
    // 特殊的，同上
    static get EXPRESSION_STATEMENT() {
        return 'EXPRESSION_STATEMENT'
    }
    static get ILLEGAL() {
        return 'ILLEGAL'
    }
    static get EOF() {
        return 'EOF'
    }
    // 标识符，字面量
    static get IDENT() {
        return 'IDENT'
    }
    static get INT() {
        return 'INT'
    }
    // 字符串
    static get STRING() {
        return 'STRING'
    }
    // 操作符
    static get ASSIGN() {
        return 'ASSIGN'
    }
    static get EQ() {
        return 'EQ'
    }
    static get NOT_EQ() {
        return 'NOT_EQ'
    }
    static get PLUS() {
        return 'PLUS'
    }
    static get MINUS() {
        return 'MINUS'
    }
    static get BANG() {
        return 'BANG'
    }
    static get ASTERISK() {
        return 'ASTERISK'
    }
    static get SLASH() {
        return 'SLASH'
    }
    static get LT() {
        return 'LT'
    }
    static get GT() {
        return 'GT'
    }
    // 分隔符
    static get COMMA() {
        return 'COMMA'
    }
    static get COLON() {
        return 'COLON'
    }
    static get SEMICOLON() {
        return 'SEMICOLON'
    }
    static get LPAREN() {
        return 'LPAREN'
    }
    static get RPAREN() {
        return 'RPAREN'
    }
    static get LBRACE() {
        return 'LBRACE'
    }
    static get RBRACE() {
        return 'RBRACE'
    }
    // 保留字
    static get LET() {
        return 'LET'
    }
    static get FUNCTION() {
        return 'FUNCTION'
    }
    static get IF() {
        return 'IF'
    }
    static get ELSE() {
        return 'ELSE'
    }
    static get TRUE() {
        return 'TRUE'
    }
    static get FALSE() {
        return 'FALSE'
    }
    static get RETURN() {
        return 'RETURN'
    }
    static get LBRACKET() {
        return 'LBRACKET'
    }
    static get RBRACKET() {
        return 'RBRACKET'
    }
}

module.exports = {
    TokenType
}