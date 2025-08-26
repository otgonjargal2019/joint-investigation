package com.lsware.joint_investigation.auth.service;

// import java.time.LocalDateTime;
// import java.time.Duration;
// import java.util.ArrayList;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.util.Optional;
// import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

//import com.lsware.joint_investigation.user.entity.Role;
//import com.lsware.joint_investigation.user.entity.UserEntity;
//import com.lsware.nfteyes.user.enums.RoleEnum;
//import com.lsware.joint_investigation.user.repository.UserRepository;

//import jakarta.transaction.Transactional;

//import com.lsware.joint_investigation.config.customException.UserAlreadyRegisteredException;
//import com.lsware.joint_investigation.config.customException.VerificationCodeRecentlySentException;
//import com.lsware.joint_investigation.repository.RoleRepository;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    //@Autowired
    //private UserRepository userRepository;

    //@Autowired
    //private RoleRepository roleRepository;

    @Autowired
    public PasswordEncoder passwordEncoder;

    public Authentication authenticate(String email, String password) throws BadCredentialsException {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password);
        return authenticationManager.authenticate(authToken);
    }

    // private String generateVerificationCode() {
    //     return String.valueOf(100000 + new Random().nextInt(900000));
    // }

    // public Map<String, String> registerUser(String email, String name) {
    //     Optional<UserEntity> existingUserOptional = userRepository.findByEmail(email, null);
    //     Map<String, String> response = new HashMap<>();

    //     if (existingUserOptional.isPresent()) {
    //         UserEntity existingUser = existingUserOptional.get();

    //         if (existingUser.isDeleted() == false && existingUser.getPassword() != null
    //                 && !existingUser.getPassword().isEmpty()) {
    //             throw new UserAlreadyRegisteredException("User with this email is already registered.");
    //         }

    //         if (existingUser.getVerifyCodeCreatedDate() != null) {
    //             Duration timeElapsed = Duration.between(existingUser.getVerifyCodeCreatedDate(), LocalDateTime.now());
    //             if (timeElapsed.toMinutes() < 1) {
    //                 throw new VerificationCodeRecentlySentException(
    //                         "A verification code was recently sent. Please wait before requesting a new one.");
    //             }
    //         }

    //         String verifyCode = generateVerificationCode();
    //         existingUser.setName(name);
    //         existingUser.setVerifyCode(verifyCode);
    //         existingUser.setVerifyCodeCreatedDate(LocalDateTime.now());

    //         UserEntity updatedUser = userRepository.save(existingUser);

    //         response.put("email", updatedUser.getEmail());
    //         response.put("verifyCode", updatedUser.getVerifyCode());

    //         return response;
    //     }

    //     String verifyCode = generateVerificationCode();
    //     UserEntity newUser = new UserEntity();
    //     newUser.setName(name);
    //     newUser.setEmail(email);
    //     newUser.setVerifyCode(verifyCode);
    //     newUser.setVerifyCodeCreatedDate(LocalDateTime.now());

    //     UserEntity savedUser = userRepository.save(newUser);

    //     response.put("email", savedUser.getEmail());
    //     response.put("verifyCode", savedUser.getVerifyCode());

    //     return response;
    // }

    // public boolean emailVerify(String email, String verificationCode) {
    //     Optional<UserEntity> userOptional = userRepository.findByEmail(email, null);

    //     if (userOptional.isEmpty()) {
    //         throw new IllegalArgumentException("No user found with this email.");
    //     }

    //     UserEntity user = userOptional.get();

    //     if (!user.getVerifyCode().equals(verificationCode)) {
    //         throw new IllegalArgumentException("Invalid verification code. Please try again.");
    //     }

    //     Duration timeElapsed = Duration.between(user.getVerifyCodeCreatedDate(), LocalDateTime.now());

    //     if (timeElapsed.toMinutes() <= 10) {
    //         userRepository.save(user);
    //         return true;
    //     }

    //     throw new IllegalArgumentException("Verification code has expired.");
    // }

    // @Transactional
    // public UserEntity signup(String email, String password) {
    //     Optional<UserEntity> userOptional = userRepository.findByEmail(email, null);
    //     if (!userOptional.isPresent()) {
    //         throw new IllegalArgumentException("No user found with this email.");
    //     }

    //     UserEntity user = userOptional.get();
    //     user.setPassword(passwordEncoder.encode(password));

    //     if (user.isDeleted()) {
    //         user.setDeleted(false);
    //     }

    //     if (user.getRoles() == null || user.getRoles().isEmpty()) {
    //         Optional<Role> roleUser = roleRepository.findByName(RoleEnum.USER);
    //         Role role = roleUser.orElseGet(() -> {
    //             Role newRole = new Role();
    //             newRole.setName(RoleEnum.USER);
    //             return roleRepository.save(newRole);
    //         });

    //         user.setRoles(new ArrayList<>(List.of(role)));
    //     }

    //     return userRepository.save(user);
    // }

    // @Transactional
    // public UserEntity updateUserPassword(String email, String password) {
    //     Optional<UserEntity> userOptional = userRepository.findByEmail(email);
    //     if (!userOptional.isPresent()) {
    //         throw new IllegalArgumentException("No user found with this email.");
    //     }
    //     UserEntity user = userOptional.get();
    //     user.setPassword(passwordEncoder.encode(password));
    //     return userRepository.save(user);
    // }

}
