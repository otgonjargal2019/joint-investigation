package com.lsware.joint_investigation.common.util;

public class FileStorageException extends RuntimeException {
	private static final long serialVersionUID = -1538928675369914273L;

	public FileStorageException(String message) {
        super(message);
    }

    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}