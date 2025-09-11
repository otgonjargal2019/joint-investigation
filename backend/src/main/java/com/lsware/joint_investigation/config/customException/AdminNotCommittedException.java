package com.lsware.joint_investigation.config.customException;

import org.springframework.security.core.AuthenticationException;

public class AdminNotCommittedException extends AuthenticationException {
    public AdminNotCommittedException(String message) {
        super(message);
    }
}
