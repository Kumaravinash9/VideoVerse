class ApiError extends Error {
  constructor(detail = "Internal Server Error", status = 404) {
    super(detail);

    this.detail = detail;
    this.status = status;
  }
}

module.exports = ApiError;
