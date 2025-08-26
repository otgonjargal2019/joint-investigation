package com.lsware.joint_investigation.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class CustomUser extends User {

    private UUID id;
    private String userId;
    private String role;

    // public CustomUser(UUID id, String email, String password, Collection<? extends GrantedAuthority> authorities) {
    //     super(email, password, authorities);
    //     this.id = id;
    //     this.email = email;
    // }

    public CustomUser(UUID id, String userId, String password, Collection<? extends GrantedAuthority> authorities, String role) {
        super(userId, password, authorities);
        this.id = id;
        this.userId = userId;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public String getRoleString(){
        return role;
    }

}
