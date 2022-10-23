// ERRORS
// https://www.luiztools.com.br/post/error-handling-em-node-js-com-express/

class BaseError extends Error {
  isOperational: any;
  statusCode: any;

  constructor(
    statusCode: any,
    isOperational: any,
    description: any,
    error: any
  ) {
    let newDescription = description;
    let newStatusCode = statusCode;
    let newIsOperational = isOperational;

    // console.log("=================", error);
    if (description == "") {
      if (error && error.response) {
        if (error.response.status) {
          newStatusCode = error.response.status;
        }
        if (error.response.statusText) {
          newDescription = error.response.statusText;
        }
        if (error.response.data && error.response.data.detail) {
          newDescription = error.response.data.detail;
        }
      }
    }

    // console.log("===EH", newStatusCode, newIsOperational, newDescription);

    super(newDescription);

    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = newStatusCode;
    this.isOperational = newIsOperational;

    // console.log("------", statusCode, isOperational, description);

    Error.captureStackTrace(this);
  }
}

module.exports = BaseError;
