class ApiResponse {
  constructor(statusCodeOrRes = 200, data = null, message = "Request successful") {
    if (
      typeof statusCodeOrRes === "object" &&
      statusCodeOrRes !== null &&
      typeof statusCodeOrRes.status === "function"
    ) {
      this.res = statusCodeOrRes;
      return;
    }

    this.statusCode = statusCodeOrRes;
    this.success = this.statusCode < 400;
    this.message = message;
    this.data = data;
  }

  success(data, message = "Request successful", statusCode = 200) {
    if (!this.res) {
      throw new Error("ApiResponse.success requires an Express response object");
    }

    return this.res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  error(message = "Request failed", statusCode = 400, errors = []) {
    if (!this.res) {
      throw new Error("ApiResponse.error requires an Express response object");
    }

    return this.res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
    });
  }
}

export { ApiResponse };
