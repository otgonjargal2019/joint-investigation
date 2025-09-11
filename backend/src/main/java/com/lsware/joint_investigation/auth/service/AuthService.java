package com.lsware.joint_investigation.auth.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.user.entity.Users;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    public PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public Authentication authenticate(String email, String password) throws BadCredentialsException {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password);
        return authenticationManager.authenticate(authToken);
    }

    public boolean checkloginIdExist(String loginId) {
        Optional<Users> user = userRepository.checkLoginIdExist(loginId); //userRepository.findByLoginId(loginId) ;

        if (!user.isEmpty()) {
            throw new IllegalArgumentException("user found with this ID.");
        }
        return false;
    }

    public boolean checkEmailExist(String email) {
        Optional<Users> user = userRepository.findByEmail(email) ;

        if (!user.isEmpty()) {
            throw new IllegalArgumentException("user found with this EMAIL.");
        }
        return false;
    }

    public Users updateUserPassword(UUID userId, String password) {
        Optional<Users> userOptional = userRepository.findByUserId(userId);
        if (!userOptional.isPresent()) {
            throw new IllegalArgumentException("No user found with this email.");
        }

        Users user = userOptional.get();
        user.setPasswordHash(passwordEncoder.encode(password));
        return userRepository.save(user);
    }
}
