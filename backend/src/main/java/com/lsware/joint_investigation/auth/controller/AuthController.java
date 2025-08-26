package com.lsware.joint_investigation.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
//import org.thymeleaf.spring6.SpringTemplateEngine;

import com.lsware.joint_investigation.auth.service.AuthService;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.config.CustomUserDetailsService;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Role;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;
import com.lsware.joint_investigation.user.repository.UserRepository;
//import com.lsware.nfteyes.user.enums.ActionType;
//import com.lsware.nfteyes.util.Email;
import com.lsware.joint_investigation.util.JwtHelper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.stream.Collectors;
//import org.thymeleaf.context.Context;
//import com.lsware.joint_investigation.util.Constant;
import java.util.Map;
//import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;

//import java.util.Random;

//import com.lsware.joint_investigation.user.repository.ActionLogRepository;
//import com.lsware.joint_investigation.user.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomUserDetailsService customUserDetailsService;
    protected Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authenticationService;

    @Autowired
    private JwtHelper jwtHelper;

    
    //@Value("${nfteyes.web}")
    //private String webUrl;

    @Autowired
    public PasswordEncoder passwordEncoder;

    @Autowired
    UserRepository userRepository;

    AuthController(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody UserDto userDto) {
        try {
            Authentication authentication = authenticationService.authenticate(
                    //userDto.getEmail(),
                    userDto.getLoginId(),
                    userDto.getPassword());

            CustomUser userDetail = (CustomUser) authentication.getPrincipal();

            //boolean isUser = userDetail.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("USER"));
            // if(!isUser){
            //     Map<String, Object> errorResponse = new HashMap<>();
            //     errorResponse.put("success", false);
            //     errorResponse.put("message", "Access denied. User role required.");
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            // }

            Map<String, Object> payload = new HashMap<>();
            payload.put("ROLE", userDetail.getRoleString());
            // payload.put("ROLE",
            //         userDetail.getAuthorities().stream().map(role -> role.getAuthority())
            //                 .collect(Collectors.toList()));
            String jwtToken = jwtHelper.generateToken(payload, userDetail.getId(), false);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("access_token", jwtToken);
            
            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Authentication failed. Invalid credentials.");

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<HashMap<String, Object>> create(@RequestBody HashMap<String, String> payload,
            Authentication authentication) {

        String email = "user1@gmail.com";
        String password = "password";
        String nameEn = "user1";

        Users testUser = new Users();
        testUser.setEmail(email);
        testUser.setNameEn(nameEn);
        // testUser.setUserId(UUID.randomUUID());
        testUser.setPasswordHash(passwordEncoder.encode(password));
        testUser.setCountry("MGL");
        testUser.setLoginId("user1");
        testUser.setNameKr("nameKr");
        testUser.setRole(Role.PLATFORM_ADMIN);
        testUser.setStatus(USER_STATUS.ACTIVE);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(testUser);

        email = "user2@gmail.com";
        nameEn = "user2";
        testUser = new Users();
        testUser.setEmail(email);
        testUser.setNameEn(nameEn);
        // testUser.setUserId(UUID.randomUUID());
        testUser.setPasswordHash(passwordEncoder.encode(password));
        testUser.setCountry("MGL");
        testUser.setLoginId("user2");
        testUser.setNameKr("nameKr2");
        testUser.setRole(Role.PLATFORM_ADMIN);
        testUser.setStatus(USER_STATUS.ACTIVE);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(testUser);


        return ResponseEntity.status(HttpStatusCode.valueOf(200)).build();
    }

    
}
