package com.lsware.joint_investigation.organisationalData.controller;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.organisationalData.dto.CombinedOrganizationalDataDto;
import com.lsware.joint_investigation.organisationalData.dto.CountryOrganizationTreeDto;
import com.lsware.joint_investigation.organisationalData.dto.ForeignInvAdminTreeDto;
import com.lsware.joint_investigation.organisationalData.service.OrganizationalDataService;
import com.lsware.joint_investigation.user.entity.Role;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/organizational-data")
@RequiredArgsConstructor
@Slf4j
public class OrganizationalDataController {

    private final OrganizationalDataService organizationalDataService;
    private final UserRepository userRepository;

    /**
     * Combined API: Get complete organizational data for INV_ADMIN
     * Returns both current country organizational structure and foreign INV_ADMIN users
     * Only accessible by INV_ADMIN role
     */
    @GetMapping("/complete-tree")
    @PreAuthorize("hasRole('INV_ADMIN')")
    public ResponseEntity<CombinedOrganizationalDataDto> getCompleteOrganizationalTree(Authentication authentication) {
        CustomUser customUser = null;
        try {
            customUser = (CustomUser) authentication.getPrincipal();

            // Get full user information from repository
            Optional<Users> currentUserOpt = userRepository.findByUserId(customUser.getId());
            if (!currentUserOpt.isPresent()) {
                log.warn("User not found in database for userId: {}", customUser.getId());
                return ResponseEntity.status(404).build();
            }

            Users currentUser = currentUserOpt.get();

            // Verify the user has INV_ADMIN role
            if (!currentUser.getRole().equals(Role.INV_ADMIN)) {
                log.warn("Access denied for user {} - role {} is not INV_ADMIN", 
                        customUser.getId(), currentUser.getRole());
                return ResponseEntity.status(403).build();
            }

            Long currentUserCountryId = currentUser.getCountryId();
            if (currentUserCountryId == null) {
                log.warn("User {} has null country ID", customUser.getId());
                return ResponseEntity.badRequest().build();
            }

            CombinedOrganizationalDataDto result = organizationalDataService
                    .getCombinedOrganizationalData(currentUserCountryId);
            log.info("Successfully retrieved complete organizational tree for user {} from country {}", 
                    customUser.getId(), currentUserCountryId);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument in getCompleteOrganizationalTree for user {}: {}", 
                     customUser != null ? customUser.getId() : "unknown", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error in getCompleteOrganizationalTree for user {}: {}", 
                     customUser != null ? customUser.getId() : "unknown", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/current-country-tree")
    @PreAuthorize("hasRole('INV_ADMIN')")
    public ResponseEntity<CountryOrganizationTreeDto> getCurrentCountryOrganizationTree(
            Authentication authentication,
            @RequestParam(required = false) String searchWord) {
        CustomUser customUser = null;
        try {
            customUser = (CustomUser) authentication.getPrincipal();
            log.debug("getCurrentCountryOrganizationTree called by user {} with searchWord: {}", 
                     customUser.getId(), searchWord);

            // Get full user information from repository
            Optional<Users> currentUserOpt = userRepository.findByUserId(customUser.getId());
            if (!currentUserOpt.isPresent()) {
                log.warn("User not found in database for userId: {}", customUser.getId());
                return ResponseEntity.status(404).build();
            }

            Users currentUser = currentUserOpt.get();

            // Verify the user has INV_ADMIN role
            if (!currentUser.getRole().equals(Role.INV_ADMIN)) {
                log.warn("Access denied for user {} - role {} is not INV_ADMIN", 
                        customUser.getId(), currentUser.getRole());
                return ResponseEntity.status(403).build();
            }

            Long currentUserCountryId = currentUser.getCountryId();
            if (currentUserCountryId == null) {
                log.warn("User {} has null country ID", customUser.getId());
                return ResponseEntity.badRequest().build();
            }

            CountryOrganizationTreeDto result = organizationalDataService
                    .getCurrentCountryOrganizationTree(currentUserCountryId, searchWord);
            log.info("Successfully retrieved current country organizational tree for user {} from country {} with searchWord: '{}'", 
                    customUser.getId(), currentUserCountryId, searchWord);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument in getCurrentCountryOrganizationTree for user {} with searchWord '{}': {}", 
                     customUser != null ? customUser.getId() : "unknown", searchWord, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error in getCurrentCountryOrganizationTree for user {} with searchWord '{}': {}", 
                     customUser != null ? customUser.getId() : "unknown", searchWord, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get foreign INV_ADMIN users tree for INV_ADMIN
     * Returns list of foreign INV_ADMIN users grouped by country
     * Supports search by country name and INV_ADMIN name
     * Only accessible by INV_ADMIN role
     */
    @GetMapping("/foreign-inv-admins-tree")
    @PreAuthorize("hasRole('INV_ADMIN')")
    public ResponseEntity<List<ForeignInvAdminTreeDto>> getForeignInvAdminsTree(
            Authentication authentication,
            @RequestParam(required = false) String searchWord) {
        CustomUser customUser = null;
        try {
            customUser = (CustomUser) authentication.getPrincipal();
            log.debug("getForeignInvAdminsTree called by user {} with searchWord: {}", 
                     customUser.getId(), searchWord);

            // Get full user information from repository
            Optional<Users> currentUserOpt = userRepository.findByUserId(customUser.getId());
            if (!currentUserOpt.isPresent()) {
                log.warn("User not found in database for userId: {}", customUser.getId());
                return ResponseEntity.status(404).build();
            }

            Users currentUser = currentUserOpt.get();

            // Verify the user has INV_ADMIN role
            if (!currentUser.getRole().equals(Role.INV_ADMIN)) {
                log.warn("Access denied for user {} - role {} is not INV_ADMIN", 
                        customUser.getId(), currentUser.getRole());
                return ResponseEntity.status(403).build();
            }

            Long currentUserCountryId = currentUser.getCountryId();
            if (currentUserCountryId == null) {
                log.warn("User {} has null country ID", customUser.getId());
                return ResponseEntity.badRequest().build();
            }

            List<ForeignInvAdminTreeDto> result = organizationalDataService
                    .getForeignInvAdminsTree(currentUserCountryId, searchWord, searchWord);
            log.info("Successfully retrieved foreign INV_ADMIN tree for user {} from country {} with searchWord: '{}'. Found {} countries", 
                    customUser.getId(), currentUserCountryId, searchWord, result.size());
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument in getForeignInvAdminsTree for user {} with searchWord '{}': {}", 
                     customUser != null ? customUser.getId() : "unknown", searchWord, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error in getForeignInvAdminsTree for user {} with searchWord '{}': {}", 
                     customUser != null ? customUser.getId() : "unknown", searchWord, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
