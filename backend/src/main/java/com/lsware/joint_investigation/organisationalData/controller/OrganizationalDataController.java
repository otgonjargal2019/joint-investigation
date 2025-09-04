package com.lsware.joint_investigation.organisationalData.controller;

import com.lsware.joint_investigation.config.CustomUser;
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
     * API 1: Get current user's country organizational structure
     * Returns headquarters, departments and INVESTIGATOR users from the same
     * country
     * Only accessible by INV_ADMIN role
     */
    @GetMapping("/current-country-tree")
    @PreAuthorize("hasRole('INV_ADMIN')")
    public ResponseEntity<CountryOrganizationTreeDto> getCurrentCountryOrganizationTree(Authentication authentication) {
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
                    .getCurrentCountryOrganizationTree(currentUserCountryId);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * API 2: Get INV_ADMIN users from other countries
     * Returns tree structure grouped by country
     * Only accessible by INV_ADMIN role
     */
    @GetMapping("/foreign-inv-admins-tree")
    @PreAuthorize("hasRole('INV_ADMIN')")
    public ResponseEntity<List<ForeignInvAdminTreeDto>> getForeignInvAdminsTree(Authentication authentication) {
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
                    .getForeignInvAdminsTree(currentUserCountryId);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
