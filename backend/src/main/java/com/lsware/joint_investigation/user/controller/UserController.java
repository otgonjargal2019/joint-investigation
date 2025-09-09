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

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.lsware.joint_investigation.auth.service.AuthService;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.common.util.CustomResponseException;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.config.customException.FileNotStoredException;
import com.lsware.joint_investigation.file.service.FileService;
import com.lsware.joint_investigation.user.dto.UpdateUserStatusRequest;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Country;
import com.lsware.joint_investigation.user.entity.Department;
import com.lsware.joint_investigation.user.entity.Headquarter;
import com.lsware.joint_investigation.user.entity.UserStatusHistory;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.CountryRepository;
import com.lsware.joint_investigation.user.repository.DepartmentRepository;
import com.lsware.joint_investigation.user.repository.HeadquarterRepository;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.user.repository.UserStatusHistoryRepository;

import java.util.HashMap;
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

    @GetMapping("/me")
    public ResponseEntity<HashMap<String, Object>> me(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();
            response.put("userId", userDetail.getId());
            Optional<Users> me = userRepository.findByUserId(userDetail.getId());
            if (me.isPresent()) {
                List<Country> listCountry = countryRepository.findAll();
                List<Headquarter> listHeadquarter = headquarterRepository.findAll();
                List<Department> listDepartments = departmentRepository.findAll();

                response.put("loginId", me.get().getLoginId());
                response.put("nameKr", me.get().getNameKr());
                response.put("nameEn", me.get().getNameEn());
                response.put("phone", me.get().getPhone());
                response.put("email", me.get().getEmail());
                response.put("avatar", me.get().getProfileImageUrl());

                response.put("listCountry", listCountry);
                response.put("listHeadquarter", listHeadquarter);
                response.put("listDepartments", listDepartments);
                response.put("userData", me.get());
            } else {
                return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @PostMapping(path = "/profile", consumes = { "multipart/form-data" })
    public ResponseEntity<HashMap<String, Object>> profile(
            @RequestPart(name = "profileImg", required = false) MultipartFile file,
            @RequestPart("profile") UserDto profile,
            Authentication authentication) throws FileNotStoredException, CustomResponseException {
        if (authentication.isAuthenticated()) {
            HashMap<String, Object> response = new HashMap<String, Object>();
            try {
                CustomUser userDetail = (CustomUser) authentication.getPrincipal();
                Optional<Users> me = userRepository.findByUserId(userDetail.getId());
                if(!me.get().getEmail().equals(profile.getEmail())) {
                    boolean emailExist = authenticationService.checkEmailExist(profile.getEmail());
                    if (emailExist) {
                        response.put("message", "Email exist.");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                    }
                }

                String avatar = null;
                if (file != null) {
                    // SAVE TO S3
                    avatar = fileService.storeProfileImage(file);
                }

                userRepository.updateProfileByUserId(userDetail.getId(), profile, avatar);
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
                response.put("message", "Profile image deleted successfully");
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
            users = userRepository.findByStatus(status, page, size);
        } else {
            users = userRepository.findAll(page, size);
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
        mapping.setFilters(getUserFilter());

        return ResponseEntity.ok(mapping);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MappingJacksonValue> getUserById(@PathVariable UUID id) {
        return userRepository.findByUserId(id)
                .map(user -> {
                    UserDto dto = mapUserWithNames(user);
                    ApiResponse<UserDto> response = new ApiResponse<>(true, "User retrieved successfully", dto, null);
                    MappingJacksonValue mapping = new MappingJacksonValue(response);
                    mapping.setFilters(getUserFilter());
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
        user.setStatus(request.getStatus());
        userRepository.save(user);

        UserStatusHistory history = new UserStatusHistory();
        history.setUser(user);
        history.setCreator(creator);
        history.setFromStatus(oldStatus);
        history.setToStatus(request.getStatus());
        history.setReason(request.getReason());
        userStatusHistoryRepository.save(history);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Status history created successfully", user.getUserId(),
                        null));
    }

    private FilterProvider getUserFilter() {
        SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
                .filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone",
                        "countryName", "headquarterName", "departmentName",
                        "status", "createdAtFormatted");

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

}
