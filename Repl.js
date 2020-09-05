const readline = require('readline');
const { Lexer } = require('./Lexer')
const { Parser } = require('./Parser')

function main() {
    // 把环境定义在这里，不然每次输入都会有一个新的环境        
    const prompt = ">>> "
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: prompt,
    });

    rl.write('欢迎来到 Monkey\r\n')
    rl.prompt()

    rl.on('line', (input) => {        
        const lexer = Lexer.new(input)
        // 测试 Parser
        const parser = Parser.new(lexer)
        const r = parser.parseProgram()
        const stmt = r.statements
        for(const s of stmt) {
            console.log(s)            
        }

        // // 测试 Lexer
        // for(let token = lexer.getNextToken(); token.type !== 'EOF'; token = lexer.getNextToken()) {
        //     console.log(token)            
        // }
        rl.prompt()
    });

    rl.on('close', () => {        
        console.log('Bye!');
    });
}

main()