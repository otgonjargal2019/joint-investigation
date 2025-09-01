package com.lsware.joint_investigation.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.lsware.joint_investigation.common.util.CustomResponseException;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.config.customException.FileNotStoredException;
import com.lsware.joint_investigation.file.service.FileService;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;
import java.util.HashMap;
import java.util.Optional;

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

    @GetMapping("/me")
    public ResponseEntity<HashMap<String, Object>> me(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();
            response.put("userId", userDetail.getId());
            Optional<Users> me = userRepository.findByUserId(userDetail.getId());
            if (me.isPresent()) {
                response.put("loginId",     me.get().getLoginId());
                response.put("nameKr",      me.get().getNameKr());
                response.put("nameEn",      me.get().getNameEn());
                response.put("country",     me.get().getCountry());
                response.put("department",  me.get().getDepartment());
                response.put("phone",       me.get().getPhone());
                response.put("email",       me.get().getEmail());
                response.put("avatar",      me.get().getProfileImageUrl());
                
            } else {
                return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @PostMapping("/profile")
    public ResponseEntity<HashMap<String, Object>> profile(
            @RequestPart(name = "avatarImg", required = false) MultipartFile file,
            @RequestPart("department") String department,
            Authentication authentication) throws FileNotStoredException, CustomResponseException {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();

            String avatar = null;

            if (file != null) {
                // SAVE TO S3
                avatar = fileService.storeProfileImage(file);
            }

            userRepository.updateProfileByUserId(userDetail.getId(), avatar, department);

            response.put("message", "Profile updated successfully");
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

}
