// 操作符优先级。没有枚举就暂时这么写吧
class OperatorPriority {
    static get LOWEST() {
        return 1
    }
    static get EQUALS() {
        // == 
        return 2
    }
    static get LESSGREATER() {
        // < >
        return 3
    }
    static get SUM() {
        return 4
    }
    static get PRODUCT() {
        return 5
    }
    static get PREFIX() {
        // - !
        return 6
    }
    static get CALL() {
        return 7
    }
    static get INDEX() {
        // 数组下标
        return 8
    }
}


module.exports = {
    OperatorPriority,
}