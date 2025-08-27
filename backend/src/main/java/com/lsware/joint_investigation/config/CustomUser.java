package com.lsware.joint_investigation.config;

import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class CustomUser extends User {

    private UUID id;

    public CustomUser(UUID id, String password, Collection<? extends GrantedAuthority> authorities) {
        super(id.toString(), password, authorities);
        this.id = id;
    }

    public UUID getId() {
        return id;
    }
}
