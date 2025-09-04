package com.lsware.joint_investigation.organisationalData.controller;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.organisationalData.dto.CombinedOrganizationalDataDto;
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
}
