package com.lsware.joint_investigation.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.lsware.joint_investigation.auth.service.AuthService;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.common.util.CustomResponseException;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.config.customException.FileNotStoredException;
import com.lsware.joint_investigation.file.service.FileService;
import com.lsware.joint_investigation.notification.service.NotificationService;
import com.lsware.joint_investigation.mail.service.EmailService;
import com.lsware.joint_investigation.user.dto.UpdateUserRoleRequest;
import com.lsware.joint_investigation.user.dto.UpdateUserStatusRequest;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Country;
import com.lsware.joint_investigation.user.entity.Department;
import com.lsware.joint_investigation.user.entity.Headquarter;
import com.lsware.joint_investigation.user.entity.Role;
import com.lsware.joint_investigation.user.entity.UserStatusHistory;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.CountryRepository;
import com.lsware.joint_investigation.user.repository.DepartmentRepository;
import com.lsware.joint_investigation.user.repository.HeadquarterRepository;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.user.repository.UserStatusHistoryRepository;
import com.lsware.joint_investigation.util.Constant;
import com.lsware.joint_investigation.util.Email;
import com.lsware.joint_investigation.user.dto.CountryDto;
import com.lsware.joint_investigation.user.dto.DepartmentDto;
import com.lsware.joint_investigation.user.dto.HeadquarterDto;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    private FileService fileService;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${nfteyes.api}")
    private String hostnameApi;

    @Autowired
    CountryRepository countryRepository;

    @Autowired
    HeadquarterRepository headquarterRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    UserStatusHistoryRepository userStatusHistoryRepository;

    @Autowired
    private AuthService authenticationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private EmailService emailService;

    @GetMapping("/me")
    public ResponseEntity<MappingJacksonValue> me(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();
            response.put("userId", userDetail.getId());
            Optional<Users> me = userRepository.findByUserId(userDetail.getId());
            if (me.isPresent()) {
                List<CountryDto> listCountry = countryRepository.findAll().stream()
                        .map(Country::toDto)
                        .collect(Collectors.toList());
                List<HeadquarterDto> listHeadquarter = headquarterRepository.findAll().stream()
                        .map(Headquarter::toDto)
                        .collect(Collectors.toList());
                List<DepartmentDto> listDepartment = departmentRepository.findAll().stream()
                        .map(Department::toDto)
                        .collect(Collectors.toList());
                response.put("listCountry", listCountry);
                response.put("listHeadquarter", listHeadquarter);
                response.put("listDepartment", listDepartment);
                response.put("userData", me.get().toDto());
            } else {
                return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
            }
            MappingJacksonValue mapping = new MappingJacksonValue(response);
            mapping.setFilters(UserController.getUserFilter());
            return ResponseEntity.ok(mapping);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @PostMapping(path = "/profile")
    public ResponseEntity<HashMap<String, Object>> profile(
            @RequestBody UserDto profile,
            Authentication authentication) throws FileNotStoredException, CustomResponseException {
        if (authentication.isAuthenticated()) {
            HashMap<String, Object> response = new HashMap<String, Object>();
            try {
                CustomUser userDetail = (CustomUser) authentication.getPrincipal();
                Optional<Users> me = userRepository.findByUserId(userDetail.getId());
                if (!me.get().getEmail().equals(profile.getEmail())) {
                    boolean emailExist = authenticationService.checkEmailExist(profile.getEmail());
                    if (emailExist) {
                        response.put("message", "Email exist.");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                    }
                }

                UserStatusHistory history = new UserStatusHistory();
                history.setUser(me.get());
                history.setCreator(me.get());
                history.setFromStatus(Users.USER_STATUS.APPROVED);
                history.setToStatus(Users.USER_STATUS.WAITING_TO_CHANGE);
                history.setReason("Profile update request");
                history.setHeadquarterId(profile.getHeadquarterId());
                history.setDepartmentId(profile.getDepartmentId());
                history.setEmail(profile.getEmail());
                history.setPhone(profile.getPhone());
                userStatusHistoryRepository.save(history);

                userRepository.updateUserStatusById(userDetail.getId(), Users.USER_STATUS.WAITING_TO_CHANGE.name());

                List<Users> adminList = userRepository.findByRole(Role.PLATFORM_ADMIN);
                if (adminList.size() > 0) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                    String formattedDateTime = LocalDateTime.now().format(formatter);
                    Map<String, String> contentMap = new LinkedHashMap<>();
                    contentMap.put("NOTIFICATION-KEY.ID", me.get().getLoginId());
                    contentMap.put("NOTIFICATION-KEY.NAME",
                            (me.get().getNameKr() != null && !me.get().getNameKr().isEmpty()) ? me.get().getNameKr()
                                    : me.get().getNameEn());
                    contentMap.put("NOTIFICATION-KEY.REQUEST-DATE", formattedDateTime);

                    for (Users admin : adminList)
                        notificationService.notifyUser(admin.getUserId(),
                                "NOTIFICATION-KEY.TITLE.MEMBER-INFORMATION-CHANGE-APPROVAL", contentMap,
                                "/admin/account-management/" + me.get().getUserId());
                }

                response.put("success", true);
                response.put("message", "Profile updated successfully");
                return ResponseEntity.ok(response);
            } catch (IllegalArgumentException e) {
                response.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @PostMapping(path = "/update-profile-img", consumes = { "multipart/form-data" })
    public ResponseEntity<HashMap<String, Object>> profileImg(
            @RequestPart(name = "profileImg", required = false) MultipartFile file,
            Authentication authentication) throws FileNotStoredException, CustomResponseException {
        if (authentication.isAuthenticated()) {
            HashMap<String, Object> response = new HashMap<String, Object>();
            try {

                CustomUser userDetail = (CustomUser) authentication.getPrincipal();
                Users me = userRepository.findByUserId(userDetail.getId())
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (me.getProfileImageUrl() != null && !me.getProfileImageUrl().isEmpty())
                    fileService.deleteFile(me.getProfileImageUrl());

                String avatar = null;
                if (file != null) {
                    // SAVE TO S3
                    avatar = fileService.storeProfileImage(file);
                }
                me.setProfileImageUrl(avatar);
                userRepository.save(me);

                response.put("success", true);
                response.put("message", "info-msg.profileimg-updated-successfully");
                response.put("avatarUrl", avatar);
                return ResponseEntity.ok(response);
            } catch (IllegalArgumentException e) {
                response.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @DeleteMapping("/deleteProfile")
    public ResponseEntity<HashMap<String, Object>> deleteProfile(Authentication authentication)
            throws CustomResponseException {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();

            Optional<Users> me = userRepository.findByUserId(userDetail.getId());
            if (me.isPresent() && me.get().getProfileImageUrl() != null) {
                // DELETE FROM S3
                fileService.deleteFile(me.get().getProfileImageUrl());

                userRepository.deleteProfileImgByUserId(userDetail.getId());

                response.put("success", true);
                response.put("message", "info-msg.profileimg-deleted-successfully");
            } else {
                response.put("success", false);
                response.put("message", "No profile image to delete");
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    private UserDto mapUserWithNames(Users user) {
        Map<Long, String> countryMap = countryRepository.findAll()
                .stream().collect(Collectors.toMap(c -> c.getId(), c -> c.getName()));
        Map<Long, String> departmentMap = departmentRepository.findAll()
                .stream().collect(Collectors.toMap(d -> d.getId(), d -> d.getName()));
        Map<Long, String> headquarterMap = headquarterRepository.findAll()
                .stream().collect(Collectors.toMap(h -> h.getId(), h -> h.getName()));

        UserDto dto = user.toDto();
        dto.setCountryName(countryMap.get(user.getCountryId()));
        dto.setDepartmentName(departmentMap.get(user.getDepartmentId()));
        dto.setHeadquarterName(headquarterMap.get(user.getHeadquarterId()));

        return dto;
    }

    @GetMapping("list")
    public ResponseEntity<MappingJacksonValue> getUsers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Users.USER_STATUS status) {

        List<Users> users;

        if (status != null) {
            users = userRepository.findByStatusExcludingPlatformAdmin(status, page, size);
        } else {
            users = userRepository.findAllExcludingPlatformAdmin(page, size);
        }

        List<UserDto> dtos = users.stream()
                .map(this::mapUserWithNames)
                .collect(Collectors.toList());

        Map<String, Object> meta = new HashMap<>();
        meta.put("currentPage", page);
        meta.put("pageSize", size);
        meta.put("totalItems", dtos.size());
        meta.put("totalPages", (int) Math.ceil((double) dtos.size() / size));
        meta.put("hasNext", dtos.size() == size);
        meta.put("hasPrevious", page > 0);

        ApiResponse<List<UserDto>> response = new ApiResponse<>(
                true,
                "Users retrieved successfully",
                dtos,
                meta);

        MappingJacksonValue mapping = new MappingJacksonValue(response);
        mapping.setFilters(UserController.getUserFilter());

        return ResponseEntity.ok(mapping);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MappingJacksonValue> getUserById(@PathVariable UUID id) {
        return userRepository.findByUserId(id)
                .map(user -> {
                    UserDto dto = mapUserWithNames(user);
                    ApiResponse<UserDto> response = new ApiResponse<>(true, "User retrieved successfully", dto, null);
                    MappingJacksonValue mapping = new MappingJacksonValue(response);
                    mapping.setFilters(UserController.getUserFilter());
                    return ResponseEntity.ok(mapping);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/update-status")
    public ResponseEntity<ApiResponse<UUID>> updateUserStatus(
            @RequestBody UpdateUserStatusRequest request) {

        CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();

        Users creator = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Users user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        Users.USER_STATUS oldStatus = user.getStatus();
        user.setStatus(request.getUserStatus());
        if (oldStatus == Users.USER_STATUS.WAITING_TO_CHANGE
                && request.getHistoryStatus() == Users.USER_STATUS.APPROVED) {

            UserStatusHistory lastHistory = userStatusHistoryRepository
                    .findTopByUser_UserIdAndFromStatusAndToStatusOrderByCreatedAtDesc(
                            user.getUserId(),
                            Users.USER_STATUS.APPROVED,
                            Users.USER_STATUS.WAITING_TO_CHANGE)
                    .orElse(null);

            if (lastHistory != null) {
                user.setHeadquarterId(lastHistory.getHeadquarterId());
                user.setDepartmentId(lastHistory.getDepartmentId());
                user.setEmail(lastHistory.getEmail());
                user.setPhone(lastHistory.getPhone());
            }
        }
        userRepository.save(user);

        UserStatusHistory history = new UserStatusHistory();
        history.setUser(user);
        history.setCreator(creator);
        history.setFromStatus(oldStatus);
        history.setToStatus(request.getHistoryStatus());

        String reason = request.getReason();
        history.setReason((reason == null || reason.isBlank()) ? null : reason.trim());

        userStatusHistoryRepository.save(history);

        // Email for denied user signup
        if (oldStatus == Users.USER_STATUS.PENDING && request.getHistoryStatus() == Users.USER_STATUS.REJECTED) {
            String mailSubject = Constant.SUBJECT_SIGNUP_DENIED;
            String templateName = Constant.MAIL_TEMPLATE_SIGNUP_DENIED;
            Map<String, Object> objectMap = new HashMap<String, Object>();
            objectMap.put("reason", reason);
            sendEmail(mailSubject, templateName, user.getEmail(),
                    objectMap);
        }

        // Call notifyUser
        if (oldStatus == Users.USER_STATUS.WAITING_TO_CHANGE) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String formattedDateTime = LocalDateTime.now().format(formatter);
            Map<String, String> contentMap = new LinkedHashMap<>();
            String title = "";

            if (request.getHistoryStatus() == Users.USER_STATUS.APPROVED) {
                title = "NOTIFICATION-KEY.TITLE.MEMBER-INFORMATION-CHANGE-APPROVAL";
                contentMap.put("NOTIFICATION-KEY.APPROVAL-DATE", formattedDateTime);

            } else if (request.getHistoryStatus() == Users.USER_STATUS.REJECTED) {
                title = "NOTIFICATION-KEY.TITLE.MEMBER-INFORMATION-CHANGE-REJECTION";
                contentMap.put("NOTIFICATION-KEY.APPROVAL-DATE", formattedDateTime);
                contentMap.put("NOTIFICATION-KEY.REASON", (reason == null || reason.isBlank()) ? "" : reason.trim());

            }

            notificationService.notifyUser(
                    request.getUserId(),
                    title,
                    contentMap,
                    "/profile");
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Status history created successfully", user.getUserId(),
                        null));
    }

    @PostMapping("/update-role")
    public ResponseEntity<ApiResponse<UUID>> updateUserRole(@RequestBody UpdateUserRoleRequest request) {

        Users user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role oldRole = user.getRole();
        user.setRole(request.getRole());
        userRepository.save(user);

        // Call notifyUser

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDateTime = LocalDateTime.now().format(formatter);
        Map<String, String> contentMap = new LinkedHashMap<>();

        contentMap.put("NOTIFICATION-KEY.APPROVAL-DATE", formattedDateTime);

        contentMap.put("NOTIFICATION-KEY.PREVIOUS-ROLE", MessageFormat.format(
                "user-role.{0}",
                oldRole));
        contentMap.put("NOTIFICATION-KEY.CURRENT-ROLE", MessageFormat.format(
                "user-role.{0}",
                request.getRole()));

        notificationService.notifyUser(
                request.getUserId(),
                "NOTIFICATION-KEY.TITLE.ACCOUNT-PERMISSION-CHANGED",
                contentMap,
                "/profile");

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Role updated successfully", user.getUserId(), null));
    }

    public static FilterProvider getUserFilter() {
        SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
                .filterOutAllExcept(
                        "userId",
                        "role",
                        "loginId",
                        "nameKr",
                        "nameEn",
                        "email",
                        "phone",
                        "countryId",
                        "headquarterId",
                        "departmentId",
                        "status",
                        "countryName",
                        "headquarterName",
                        "departmentName",
                        "profileImageUrl",
                        "createdAt",
                        "createdAtFormatted");

        return new SimpleFilterProvider().addFilter("UserFilter", userFilter);
    }

    @PostMapping("/changePassword")
    public ResponseEntity<HashMap<String, Object>> changePassword(@RequestBody HashMap<String, String> payload,
            Authentication authentication) throws CustomResponseException {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            Optional<Users> me = userRepository.findByUserId(userDetail.getId());
            HashMap<String, Object> response = new HashMap<String, Object>();
            try {

                authenticationService.authenticate(
                        me.get().getLoginId(),
                        payload.get("currentPassword"));

                authenticationService.updateUserPassword(userDetail.getId(), payload.get("newPassword"));
                response.put("success", true);
                response.put("message", "Updated password successfully");
                return ResponseEntity.ok(response);

            } catch (AuthenticationException e) {
                response.put("message", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            } catch (Exception e) {
                response.put("message", "Failed to change password");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    private void sendEmail(String mailSubject, String templateName, String emailEntered,
            Map<String, Object> objectMap) {

        // CONTEXT,HTML
        Context context = new Context();
        context.setVariables(objectMap);

        String html = templateEngine.process(templateName, context);
        String[] s = { emailEntered };

        // NEW EMAIL
        Email email = new Email();
        email.setRecipientList(s);
        email.setSubject(mailSubject);
        email.setContent(html);
        emailService.sendEmailHtml(email);
    }
}
