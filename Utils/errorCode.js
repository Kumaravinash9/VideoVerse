
class ErrorCode {

    static get IN_COMPLETE_DATA(){
        return 408;
    }

    static get UNAUTHORIZED() {
        return 401;
    }

    static get SESSION_EXISTS() {
        return 403;
    }
}

module.exports = ErrorCode;