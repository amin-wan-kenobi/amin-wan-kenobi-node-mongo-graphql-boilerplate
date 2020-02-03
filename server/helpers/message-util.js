export const generateError = (code, message) => {
    return {
        error: {
            code,
            message,
        },
    };
};

export const RESPONSE_CODES = {
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
};

const ERRORS = {
    //1001-1099 LOGIN ERRORS
    NO_TOKEN: generateError("1001", 'AUTHORIZATION TOKEN SHOULD EXIST').error.code,
    WRONG_TOKEN: generateError("1002", 'TOKEN WAS WRONG').error.code,
    EXPIRED_TOKEN: generateError("1003", 'TOKEN WAS EXPIRED').error.code,
    WRONG_CREDENTIALS: generateError("1004", 'WRONG CREDENTIALS').error.code,
    INVALID_EMAIL_TYPE: generateError("1005", 'EMAIL ADDRESS SHOULD BE VALID').error.code,

    //2001 NETWORK ERRORS
    PAGE_NOT_FOUND: generateError("2001", 'PAGE NOT FOUND').error.code,
    NETWORK_ISSUE: generateError("2002", 'NETWORK ISSUE').error.code,
    UNKNOW_ERROR: generateError("2003", 'UNKNOWN ERROR').error.code,

    //3001 SESSION ERRORS

    //4001 SECURITY ERRORS
    ACCESS_DENIED: generateError("4001", 'ACCESS TO THIS RESOURCE IS DENIED').error.code,

    //5001 CODE ERRORS
    ID_REQUIRED: generateError("5001", "ID IS REQUIRED").error.code,

    //6001 FILE ERRORS
    NO_FILE_WAS_PROVIDED: generateError("6001", "FILE IS REQUIRED").error.code,
    ERROR_IN_RECORD: generateError("6002", "ERROR IN RECORD").error.code,
    TICKET_TYPE_DOES_NOT_EXIST: generateError("6003", "TICKET_TYPE_DOES_NOT_EXIST").error.code,
    DUPLICATED_TICKET_UID: generateError("6004", "DUPLICATED TICKET UID IN THE FILE").error.code,

    //
    MODEL_NOT_FOUND: generateError("7001", "MODEL WAS NOT FOUND").error.code,
};
export default ERRORS;