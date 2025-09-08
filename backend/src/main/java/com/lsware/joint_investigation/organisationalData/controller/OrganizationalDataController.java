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
        try {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();

            // Get full user information from repository
            Optional<Users> currentUserOpt = userRepository.findByUserId(customUser.getId());
            if (!currentUserOpt.isPresent()) {
                return ResponseEntity.status(404).build();
            }

            Users currentUser = currentUserOpt.get();

            // Verify the user has INV_ADMIN role
            if (!currentUser.getRole().equals(Role.INV_ADMIN)) {
                return ResponseEntity.status(403).build();
            }

            Long currentUserCountryId = currentUser.getCountryId();
            if (currentUserCountryId == null) {
                return ResponseEntity.badRequest().build();
            }

            CombinedOrganizationalDataDto result = organizationalDataService
                    .getCombinedOrganizationalData(currentUserCountryId);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get current country organizational tree for INV_ADMIN
     * Returns organizational structure (headquarters, departments, investigators) for current user's country
     * Supports search by country name, headquarter name, department name, and investigator name
     * Only accessible by INV_ADMIN role
     */
    @GetMapping("/current-country-tree")
    @PreAuthorize("hasRole('INV_ADMIN')")
    public ResponseEntity<CountryOrganizationTreeDto> getCurrentCountryOrganizationTree(
            Authentication authentication,
            @RequestParam(required = false) String countryName,
            @RequestParam(required = false) String headquarterName,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String investigatorName) {
        try {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();

            // Get full user information from repository
            Optional<Users> currentUserOpt = userRepository.findByUserId(customUser.getId());
            if (!currentUserOpt.isPresent()) {
                return ResponseEntity.status(404).build();
            }

            Users currentUser = currentUserOpt.get();

            // Verify the user has INV_ADMIN role
            if (!currentUser.getRole().equals(Role.INV_ADMIN)) {
                return ResponseEntity.status(403).build();
            }

            Long currentUserCountryId = currentUser.getCountryId();
            if (currentUserCountryId == null) {
                return ResponseEntity.badRequest().build();
            }

            CountryOrganizationTreeDto result = organizationalDataService
                    .getCurrentCountryOrganizationTree(currentUserCountryId, countryName, headquarterName, departmentName, investigatorName);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
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
            @RequestParam(required = false) String countryName,
            @RequestParam(required = false) String invAdminName) {
        try {
            CustomUser customUser = (CustomUser) authentication.getPrincipal();

            // Get full user information from repository
            Optional<Users> currentUserOpt = userRepository.findByUserId(customUser.getId());
            if (!currentUserOpt.isPresent()) {
                return ResponseEntity.status(404).build();
            }

            Users currentUser = currentUserOpt.get();

            // Verify the user has INV_ADMIN role
            if (!currentUser.getRole().equals(Role.INV_ADMIN)) {
                return ResponseEntity.status(403).build();
            }

            Long currentUserCountryId = currentUser.getCountryId();
            if (currentUserCountryId == null) {
                return ResponseEntity.badRequest().build();
            }

            List<ForeignInvAdminTreeDto> result = organizationalDataService
                    .getForeignInvAdminsTree(currentUserCountryId, countryName, invAdminName);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
