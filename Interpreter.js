const { TokenType } = require('./TokenType.js')
const { Lexer } = require('./Lexer')
const { Parser } = require('./Parser')
const { log } = require('./Utils.js')
const { ObjectType } = require('./ObjectType')
const { IntegerType, BooleanType, StringType, BuiltinType,
        ArrayType, HashType, FunctionType, ReturnValueType, NullType, 
        ErrorType, Environment } = require('./Object.js')

const BOOL_POOL = {
    'true': BooleanType.new(TokenType.TRUE),
    'false': BooleanType.new(TokenType.FALSE),
}

const BUILTIN_POOL = {
    'len': BuiltinType.new('len', function(args) {
        if(args.length !== 1) {
            return ErrorType.new(`wrong number of arguments, expected 1, but got ${args.length}`)
        }
        const stringLiteral = args[0]
        const type = stringLiteral.constructor.name
        if(type === 'StringType') {
            return IntegerType.new(stringLiteral.value.length)
        } else if(type === 'ArrayType') {
            return IntegerType.new(stringLiteral.elements.length)
        }
        return ErrorType.new(`argument to 'len' not supported, got ${type}`)
    }),
    'first': BuiltinType.new('first', function(args) {
        if(args.length !== 1) {
            return ErrorType.new(`wrong number of arguments, expected 1, but got ${args.length}`)
        }        
        if(args[0].constructor.name !== 'ArrayType') {
            return ErrorType.new(`argument to first must be ARRAY, but got ${args[0].type}`)
        }
        const arr = args[0]
        if(arr.elements.length > 0) {
            return arr.elements[0]
        }
        return NullType.new(null)
    }),
    'rest': BuiltinType.new('rest', function(args) {
        if(args.length !== 1) {
            return ErrorType.new(`wrong number of arguments, expected 1, but got ${args.length}`)
        }
        // log('args[0]', args[0])
        if(args[0].constructor.name !== 'ArrayType') {
            return ErrorType.new(`argument to rest must be ARRAY, but got ${args[0].type}`)
        }
        const arr = args[0]
        if(arr.elements.length > 0) {
            const l = arr.elements.slice(1)            
            return ArrayType.new(l)
        }
        return NullType.new(null)
    }),
    'push': BuiltinType.new('push', function(args) {
        if(args.length !== 2) {
            return ErrorType.new(`wrong number of arguments, expected 2, but got ${args.length}`)
        }        
        if(args[0].constructor.name !== 'ArrayType') {
            return ErrorType.new(`argument to push must be ARRAY, but got ${args[0].type}`)
        }        
        const arr = args[0]
        arr.elements.push(args[1])
        
        return arr
    }),
}

class Interpreter {
    constructor(ast) {
        this.ast = ast
    }

    static new(ast) {
        return new this(ast)
    }

    monkeyEval(astNode, env) {
        console.log('astNode 类型', astNode.constructor.name);
        const rootNodeType = astNode.constructor.name
        let tempVal, left, right
        switch(rootNodeType) {
            case 'ProgramNode':
                // log('ProgramNode 类型')
                // return this.evalStatements(astNode.statements)
                return this.evalProgram(astNode, env)
            case 'ExpressionStatementNode':
                // log('ExpressionStatementNode 类型', astNode)
                return this.monkeyEval(astNode.expression, env)
            case 'IntegerNode':
                // log('IntegerNode 类型')
                return IntegerType.new(astNode.value)
            case 'BoolNode':
                // log('BoolNode 类型', astNode)
                return BOOL_POOL[astNode.value]
            case 'StringNode':
                // log('stringNode', astNode)
                return StringType.new(astNode.value)
            case 'PrefixNode':
                // log('PrefixNode 类型')
                tempVal = this.monkeyEval(astNode.right, env)
                // log('tempVal', tempVal)
                return this.evalPrefixExpr(astNode.op, tempVal)
            case 'InfixNode':
                // log('InfixNode 类型', astNode)
                left = this.monkeyEval(astNode.left, env)
                right = this.monkeyEval(astNode.right, env)
                return this.evalInfixExpr(astNode.op, left, right)
            case 'IfNode':
                // log('IfNode', astNode)
                return this.evalIfExpression(astNode, env)
            case 'BlockNode':
                // log('BlockNode')
                // return this.evalStatements(astNode.statements)
                return this.evalBlockStatement(astNode, env)
            case 'ReturnNode':
                // log('ReturnNode', astNode)
                tempVal = this.monkeyEval(astNode.returnValue, env)
                return ReturnValueType.new(tempVal.value)
            case 'LetNode':
                // log('LetNode', astNode)
                tempVal = this.monkeyEval(astNode.value, env)
                env.set(astNode.name.value, tempVal)
                // log('after set env', env)
                return env
            case 'IdentNode':
                // log('IdentNode', astNode)
                return this.evalIdent(astNode, env)
            case 'FunctionNode':
                // log('FunctionNode', astNode)
                const params = astNode.parameters
                const body = astNode.body
                return FunctionType.new(params, body, env)
            case 'CallNode':
                // log('CallNode', astNode)
                const fn = this.monkeyEval(astNode.funExp, env)
                // log('fn', fn, fn.body.statements[0])
                const args = this.evalExpressions(astNode.args, env)
                // log('args', args)
                return this.applyFunction(fn, args)
            case 'ArrayNode':
                // log('ArrayNode', astNode)
                const elems = this.evalExpressions(astNode.elements, env)
                // log('elems', elems)
                return ArrayType.new(elems)
            case 'ArrayIndexNode':
                // log('ArrayIndexNode', astNode)
                left = this.monkeyEval(astNode.left, env)
                const index = this.monkeyEval(astNode.index, env)
                // log('elems', elems)
                return this.evalIndexExpression(left, index)
            case 'HashNode':
                // log('HashNode', astNode)
                return this.evalHash(astNode, env)
            default:
                log('没找到')
                return NullType.new(astNode.value)
        }
    }

    evalProgram(astNode, env) {
        // log('evalProgram')
        const statements = astNode.statements
        let result
        for(const stmt of statements) {
            result = this.monkeyEval(stmt, env)
            const name = result.constructor.name
            if(name === 'ReturnValueType' || name === 'ErrorType') {
                // log('该返回了', result)
                return result
            }   
        }
        // return NullType.new(null)
        return result
    }

    // evalStatements(statements) {
    //     log('evalStatements')
    //     for(const stmt of statements) {
    //         return this.monkeyEval(stmt)
    //     }
    //     return NullType.new(null)
    // }

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

        if(left.constructor.name === 'StringType' && right.constructor.name === 'StringType') {
            return this.evalStringInfixExpr(op, left, right)
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

    evalStringInfixExpr(op, left, right) {
        const a = left.value
        const b = right.value
        
        return StringType.new(a + b)
    }

    evalIfExpression(astNode) {        
        const condition = astNode.condition
        const conditionValue = this.monkeyEval(condition)
        
        if(this.isTruthy(conditionValue)) {
            return this.monkeyEval(astNode.consequence)
        } else {
            return this.monkeyEval(astNode.alternative)
        }
    }

    evalBlockStatement(astNode, env) {
        // TODO。block 可以没有 return 语句，把最后一个当成返回值。暂时这样处理
        let result = null
        const statements = astNode.statements
        for(const stmt of statements) {
            result = this.monkeyEval(stmt, env)            
            if(result.type === ObjectType.RETURN_VALUE_OBJ) {
                return result
            }
        }
        
        return result
    }

    evalExpressions(args, env) {
        const l = []
        for(const item of args) {
            const r = this.monkeyEval(item, env)
            // TODO。错误处理
            l.push(r)
        }

        return l
    }

    applyFunction(fn, args) {
        if(fn.constructor.name === 'BuiltinType') {
            // 内置函数特殊处理一下
            return fn.impl.call(this, args)
        }

        const extendedEnv = this.extendFuncEnv(fn, args)
        const evaluated = this.monkeyEval(fn.body, extendedEnv)

        return evaluated
    }

    extendFuncEnv(fn, args) {
        // log('fn', fn)
        const enclosingEnv = fn.env
        const innerEnv = Environment.new()
        innerEnv.setEnclosingEnv(enclosingEnv)

        const params = fn.params
        for(let i = 0, len = params.length; i < len; i += 1) {
            // TODO。这里有问题，不应该使用对象作为键值
            innerEnv.set(params[i].value, args[i])
        }
        
        return innerEnv
    }

    evalIndexExpression(left, index) {
        // log('left', left)
        // log('index', index)
        if(left.constructor.name === 'HashType') {
            return left.pairs[index.value]
        } else {
            // 不要错误处理了
            // const v = index.value
            // const l = left.elements
            // if(v < 0 || v > l.length) {
            //     return NullType.new(null)
            // }    
            return left.elements[index.value]    
        }
    }

    evalHash(astNode, env) {
        const m = {}
        const pairs = astNode.pairs
        const keys = Object.keys(pairs)
        for(const key of keys) {
            const v = this.monkeyEval(pairs[key])
            log('v', v)
            m[key] = v
        }
        
        return HashType.new(m)
    }

    evalIdent(astNode, env) {
        const name = astNode.value
        const v = env.get(name)

        if(v === undefined) {
            return BUILTIN_POOL[name]
        }
        
        return v
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
    // 函数测试：
    // let newAdder = fn(x) { fn(y) { x + y } };let addTwo = newAdder(2);addTwo(3);
    // [1, 2, 3][0]
    // [1, 2, 3][1]
    // [1, 2, 3][2]
    // let i = 0; [1, 2, 3][i + 1]
    // let myArray = [1, 2, 3]; myArray[2]
    // let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];
    // let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]
    // [1, 2, 3][-1]
    // [1, 2, 3][4]
    const code =  `
        let person = { "name": "Bob", "age": 29 }
        person["name"]
    `
    const lexer = Lexer.new(code)
    const parser = Parser.new(lexer)
    const ast = parser.parseProgram()
    // log('ast', ast.statements)

    const interpreter = Interpreter.new(ast)
    const env = Environment.new()
    const result = interpreter.monkeyEval(ast, env)

    log('result\n', result)
    // log('env\n', env.get('newAdder').body.statements[0].expression.body.statements)
    // log('env\n', env)
}


main()


module.exports = {
    Interpreter,
}