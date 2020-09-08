class ObjectType {
    static get INTEGER_OBJ() {
        return 'INTEGER'
    }
    static get BOOLEAN_OBJ() {
        return 'BOOLEAN'
    }
    static get RETURN_VALUE_OBJ() {
        return 'RETURN_VALUE'
    }
    static get FUNCTION_OBJ() {
        return 'FUNCTION'
    }
    static get ERROR_OBJ() {
        return 'ERROR'
    }
    static get NULL_OBJ() {
        return 'NULL'
    }
}


module.exports = {
    ObjectType,
}