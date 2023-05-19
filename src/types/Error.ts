export enum ErrorCodes {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
}

export enum ErrorMessages {
    BadRequest = 'You have provided an invalid request payload.',
    Unauthorized = 'Unauthorized',
    Forbidden = 'Forbidden',
    NotFound = 'Resource not found.',
    ServerError = 'An internal server error occurred.',
}
