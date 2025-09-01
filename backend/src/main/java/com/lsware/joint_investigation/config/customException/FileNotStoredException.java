package com.lsware.joint_investigation.config.customException;

public class FileNotStoredException extends Exception {
    private static final long serialVersionUID = 1L;

    public FileNotStoredException(String message) {
        super(message);
    }
}
