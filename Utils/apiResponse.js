/**
 * @name ApiResponse
 * @description This class is protoype for standard response format
 */
class ApiResponse {
  constructor(data = null, status = 200, message = "SUCCESS") {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
