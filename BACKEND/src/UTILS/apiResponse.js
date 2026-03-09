class ApiResponse {
    constructor(res) {
        this.res = res;
    }

    success(data, message = "Request successful") {
        this.res.status(200).json({
            success: true,
            message,
            data
        });
    }

    error(message = "Request failed", statusCode = 400) {
        this.res.status(statusCode).json({
            success: false,
            message
        });
    }
}

export { ApiResponse };