package com.lsware.joint_investigation.config;

import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class CustomUser extends User {

    private UUID id;
    private String role;

    public CustomUser(UUID id, String password, Collection<? extends GrantedAuthority> authorities, String role) {
        super(id.toString(), password, authorities);
        this.id = id;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public String getRoleString(){
        return role;
    }

}
