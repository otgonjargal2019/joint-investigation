package com.lsware.joint_investigation.common.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

public class CustomResponseException extends RuntimeException {

    protected static Logger logger = LoggerFactory.getLogger(CustomResponseException.class);

    private static final long serialVersionUID = 8155478594708074391L;
    private HttpStatus status;

    public CustomResponseException() {
        super();
    }

    public CustomResponseException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public CustomResponseException(String message, Throwable cause) {
        super(message, cause);
    }

    public CustomResponseException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public CustomResponseException(Throwable cause) {
        super(cause);
    }

    public HttpStatus getStatus() {
        return status;
    }
}