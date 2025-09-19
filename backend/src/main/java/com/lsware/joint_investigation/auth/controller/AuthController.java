package com.lsware.joint_investigation.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.lsware.joint_investigation.auth.service.AuthService;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.notification.service.NotificationService;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Role;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;
import com.lsware.joint_investigation.user.repository.CountryRepository;
import com.lsware.joint_investigation.user.repository.DepartmentRepository;
import com.lsware.joint_investigation.user.repository.HeadquarterRepository;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.util.JwtHelper;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    protected Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authenticationService;

    @Autowired
    private JwtHelper jwtHelper;

    @Autowired
    public PasswordEncoder passwordEncoder;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CountryRepository countryRepository;

    @Autowired
    HeadquarterRepository headquarterRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody UserDto userDto,
            HttpServletResponse response) {
        try {
            Authentication authentication = authenticationService.authenticate(
                    userDto.getLoginId(),
                    userDto.getPassword());

            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            Map<String, Object> payload = new HashMap<>();
            // Remove ROLE_ prefix when storing in JWT
            String role = userDetail.getAuthorities().stream()
                    .findFirst()
                    .get()
                    .getAuthority()
                    .replace("ROLE_", "");
            payload.put("role", role);
            String jwtToken = jwtHelper.generateToken(payload, userDetail.getId(), false);

            Cookie cookie = new Cookie("access_token", jwtToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // true in production with HTTPS
            cookie.setPath("/");
            if (userDto.isStayLoggedIn())
                cookie.setMaxAge(60 * 60 * 10); // 10 hour
            else
                cookie.setMaxAge(-1);
            response.addCookie(cookie);

            // Response JSON (no token)
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Login successful");
            // res.put("access_token", jwtToken);
            return ResponseEntity.ok(res);
        } catch (AuthenticationException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);

            if ("ADMIN_CONFIRMATION_NEEDED".equals(ex.getMessage()))
                errorResponse.put("message", "ADMIN_CONFIRMATION_NEEDED");
            else
                errorResponse.put("message", "Authentication failed. Invalid credentials.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }
    }

    @PostMapping("/checkloginid")
    public ResponseEntity<HashMap<String, String>> checkUserId(
            @RequestBody UserDto userDto) {

        HashMap<String, String> response = new HashMap<>();

        try {
            boolean idExist = authenticationService.checkloginIdExist(userDto.getLoginId());

            if (!idExist) {
                response.put("message", "LoginID not exist.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "LoginID exist.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/checkemail")
    public ResponseEntity<HashMap<String, String>> checkEmail(
            @RequestBody UserDto userDto) {

        HashMap<String, String> response = new HashMap<>();
        try {
            boolean emailExist = authenticationService.checkEmailExist(userDto.getEmail());
            if (!emailExist) {
                response.put("message", "Email not exist.");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Email exist.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody UserDto userDto) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean idExist = authenticationService.checkloginIdExist(userDto.getLoginId());
            if (idExist) {
                response.put("message", "LoginID exist.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            boolean emailExist = authenticationService.checkEmailExist(userDto.getEmail());
            if (emailExist) {
                response.put("message", "Email exist.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Users user = new Users();
            user.setLoginId(userDto.getLoginId());
            user.setNameKr(userDto.getNameKr());
            user.setNameEn(userDto.getNameEn());
            user.setEmail(userDto.getEmail());
            user.setPhone(userDto.getPhone());
            // user.setCountry(userDto.getCountry());
            // user.setDepartment(userDto.getDepartment());
            user.setRole(Role.INVESTIGATOR);
            user.setStatus(Users.USER_STATUS.PENDING);
            String passwordString = userDto.getPassword();
            user.setPasswordHash(passwordEncoder.encode(passwordString));
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setCountryId(Long.valueOf(userDto.getCountryId()));
            user.setHeadquarterId(Long.valueOf(userDto.getHeadquarterId()));
            user.setDepartmentId(Long.valueOf(userDto.getDepartmentId()));
            userRepository.save(user);

            List<Users> adminList = userRepository.findByRole(Role.PLATFORM_ADMIN);
            if (adminList.size() > 0) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                String formattedDateTime = LocalDateTime.now().format(formatter);
                Map<String, String> contentMap = new LinkedHashMap<>();
                contentMap.put("ID", userDto.getLoginId());
                contentMap.put("성명", userDto.getNameKr());
                contentMap.put("요청 일시", formattedDateTime);

                for (Users admin : adminList)
                    notificationService.notifyUser(admin.getUserId(), "신규 계정 등록", contentMap, null);
            }

            response.put("success", true);
            response.put("message", "Signup successful");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<HashMap<String, Object>> create() {

        String email = "user1@gmail.com";
        String password = "password";
        String nameEn = "user1";

        Users testUser = new Users();
        testUser.setEmail(email);
        testUser.setNameEn(nameEn);
        // testUser.setUserId(UUID.randomUUID());
        testUser.setPasswordHash(passwordEncoder.encode(password));
        // testUser.setCountry("MGL");
        testUser.setLoginId("user1");
        testUser.setNameKr("nameKr");
        testUser.setRole(Role.PLATFORM_ADMIN);
        testUser.setStatus(USER_STATUS.APPROVED);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        testUser.setCountryId(Long.valueOf(1));
        testUser.setDepartmentId(Long.valueOf(1));
        testUser.setHeadquarterId(Long.valueOf(1));
        userRepository.save(testUser);

        email = "user2@gmail.com";
        nameEn = "user2";
        testUser = new Users();
        testUser.setEmail(email);
        testUser.setNameEn(nameEn);
        // testUser.setUserId(UUID.randomUUID());
        testUser.setPasswordHash(passwordEncoder.encode(password));
        // testUser.setCountry("MGL");
        testUser.setLoginId("user2");
        testUser.setNameKr("nameKr2");
        testUser.setRole(Role.PLATFORM_ADMIN);
        testUser.setStatus(USER_STATUS.APPROVED);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        testUser.setCountryId(Long.valueOf(1));
        testUser.setDepartmentId(Long.valueOf(1));
        testUser.setHeadquarterId(Long.valueOf(1));
        userRepository.save(testUser);

        return ResponseEntity.status(HttpStatusCode.valueOf(200)).build();
    }
}
