package com.lsware.joint_investigation.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.entity.Country;
import com.lsware.joint_investigation.user.entity.Department;
import com.lsware.joint_investigation.user.entity.Headquarter;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.CountryRepository;
import com.lsware.joint_investigation.user.repository.DepartmentRepository;
import com.lsware.joint_investigation.user.repository.HeadquarterRepository;
import com.lsware.joint_investigation.user.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
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

    @Autowired
    CountryRepository countryRepository;

    @Autowired
    HeadquarterRepository headquarterRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @GetMapping("/me")
    public ResponseEntity<HashMap<String, Object>> me(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();
            response.put("userId", userDetail.getId());
            Optional<Users> me = userRepository.findByUserId(userDetail.getId());
            if (me.isPresent()) {
                List<Country>       listCountry =           countryRepository.findAll();
                List<Headquarter>   listHeadquarter =       headquarterRepository.findAll();
                List<Department>    listDepartments =       departmentRepository.findAll();

                response.put("loginId",     me.get().getLoginId());
                response.put("nameKr",      me.get().getNameKr());
                response.put("nameEn",      me.get().getNameEn());
                response.put("country",     me.get().getCountry());
                response.put("department",  me.get().getDepartment());
                response.put("phone",       me.get().getPhone());
                response.put("email",       me.get().getEmail());
                response.put("avatar",      me.get().getProfileImageUrl());

                response.put("listCountry",     listCountry);
                response.put("listHeadquarter", listHeadquarter);
                response.put("listDepartments", listDepartments);
                response.put("userData",        me.get());
            } else {
                return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @PostMapping(path = "/profile", consumes = { "multipart/form-data"})
    public ResponseEntity<HashMap<String, Object>> profile(
            @RequestPart(name = "profileImg", required = false) MultipartFile file,
            @RequestPart("profile") UserDto profile,
            Authentication authentication) throws FileNotStoredException, CustomResponseException {
        if (authentication.isAuthenticated()) {
            CustomUser userDetail = (CustomUser) authentication.getPrincipal();
            HashMap<String, Object> response = new HashMap<String, Object>();

            String avatar = null;

            if (file != null) {
                // SAVE TO S3
                avatar = fileService.storeProfileImage(file);
            }

            userRepository.updateProfileByUserId(userDetail.getId(), profile, avatar);

            response.put("success", true);
            response.put("message", "Profile updated successfully");
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).build();
    }

    @DeleteMapping("/deleteProfile")
    public ResponseEntity<HashMap<String, Object>> deleteProfile(Authentication authentication) throws CustomResponseException {
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

}
