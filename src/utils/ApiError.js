class ApiError extends Error {
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        static=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=true
        this.errors=errors

        if (static) {
            this.stack=static
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}