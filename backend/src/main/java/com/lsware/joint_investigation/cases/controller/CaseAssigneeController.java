package com.lsware.joint_investigation.cases.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.lsware.joint_investigation.cases.dto.AssignUsersRequest;
import com.lsware.joint_investigation.cases.dto.CaseAssigneeDto;
import com.lsware.joint_investigation.cases.dto.RemoveAssigneesRequest;
import com.lsware.joint_investigation.cases.service.CaseAssigneeService;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.user.controller.UserController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@Slf4j
public class CaseAssigneeController {

    private final CaseAssigneeService caseAssigneeService;

    /**
     * Assign users to a case
     * Only accessible by INV_ADMIN and PLATFORM_ADMIN
     */
    @PostMapping("/assign-users")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<MappingJacksonValue> assignUsersToCase(
            @RequestBody AssignUsersRequest request,
            Authentication authentication) {
        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.info("User {} assigning users to case {}", customUser.getId(), request.getCaseId());

        try {
            List<CaseAssigneeDto> assignments = caseAssigneeService.assignUsersToCase(request);
            log.info("Successfully assigned {} users to case {}",
                    request.getUserIds().size(), request.getCaseId());
            MappingJacksonValue mapping = new MappingJacksonValue(assignments);

            mapping.setFilters(UserController.getUserFilter());
            return ResponseEntity.ok(mapping);

        } catch (IllegalArgumentException e) {
            log.error("Invalid request for assigning users to case {}: {}",
                    request.getCaseId(), e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error assigning users to case {}: {}",
                    request.getCaseId(), e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Remove users from a case
     * Only accessible by INV_ADMIN and PLATFORM_ADMIN
     */
    @PostMapping("/remove-assignees")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Void> removeUsersFromCase(
            @RequestBody RemoveAssigneesRequest request,
            Authentication authentication) {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.info("User {} removing users from case {}", customUser.getId(), request.getCaseId());

        try {
            caseAssigneeService.removeUsersFromCase(request);
            log.info("Successfully removed {} users from case {}",
                    request.getUserIds().size(), request.getCaseId());
            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {
            log.error("Invalid request for removing users from case {}: {}",
                    request.getCaseId(), e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error removing users from case {}: {}",
                    request.getCaseId(), e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all users assigned to a case
     * Accessible by all authenticated users
     */
    @GetMapping("/{caseId}/assignees")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR')")
    public ResponseEntity<MappingJacksonValue> getCaseAssignees(
            @PathVariable UUID caseId,
            Authentication authentication) {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.debug("User {} fetching assignees for case {}", customUser.getId(), caseId);

        try {
            List<CaseAssigneeDto> assignees = caseAssigneeService.getCaseAssignees(caseId);
            log.info("Retrieved {} assignees for case {}", assignees.size(), caseId);

            MappingJacksonValue mapping = new MappingJacksonValue(assignees);

            mapping.setFilters(UserController.getUserFilter());
            return ResponseEntity.ok(mapping);

        } catch (Exception e) {
            log.error("Error fetching assignees for case {}: {}", caseId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update all assignments for a case (replace existing assignments)
     * Only accessible by INV_ADMIN and PLATFORM_ADMIN
     */
    @PutMapping("/{caseId}/assignees")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<CaseAssigneeDto>> updateCaseAssignments(
            @PathVariable UUID caseId,
            @RequestBody AssignUsersRequest request,
            Authentication authentication) {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.info("User {} updating all assignments for case {}", customUser.getId(), caseId);

        try {
            // Set the case ID in the request
            request.setCaseId(caseId);

            List<CaseAssigneeDto> updatedAssignments = caseAssigneeService.updateCaseAssignments(request);
            log.info("Successfully updated assignments for case {} with {} users",
                    caseId, request.getUserIds().size());
            return ResponseEntity.ok(updatedAssignments);

        } catch (IllegalArgumentException e) {
            log.error("Invalid request for updating assignments for case {}: {}",
                    caseId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error updating assignments for case {}: {}",
                    caseId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all cases assigned to the current user
     * Accessible by all authenticated users
     */
    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR')")
    public ResponseEntity<List<CaseAssigneeDto>> getMyAssignments(Authentication authentication) {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.debug("User {} fetching their case assignments", customUser.getId());

        try {
            List<CaseAssigneeDto> assignments = caseAssigneeService.getUserAssignments(customUser.getId());
            log.info("Retrieved {} case assignments for user {}", assignments.size(), customUser.getId());
            return ResponseEntity.ok(assignments);

        } catch (Exception e) {
            log.error("Error fetching case assignments for user {}: {}",
                    customUser.getId(), e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get cases assigned to a specific user
     * Only accessible by INV_ADMIN and PLATFORM_ADMIN
     */
    @GetMapping("/user/{userId}/assignments")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<CaseAssigneeDto>> getUserAssignments(
            @PathVariable UUID userId,
            Authentication authentication) {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.debug("User {} fetching case assignments for user {}", customUser.getId(), userId);

        try {
            List<CaseAssigneeDto> assignments = caseAssigneeService.getUserAssignments(userId);
            log.info("Retrieved {} case assignments for user {}", assignments.size(), userId);
            return ResponseEntity.ok(assignments);

        } catch (Exception e) {
            log.error("Error fetching case assignments for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Check if a user is assigned to a case
     * Accessible by all authenticated users
     */
    @GetMapping("/{caseId}/assignees/{userId}/exists")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR')")
    public ResponseEntity<Boolean> isUserAssignedToCase(
            @PathVariable UUID caseId,
            @PathVariable UUID userId,
            Authentication authentication) {

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        log.debug("User {} checking if user {} is assigned to case {}",
                customUser.getId(), userId, caseId);

        try {
            boolean isAssigned = caseAssigneeService.isUserAssignedToCase(caseId, userId);
            return ResponseEntity.ok(isAssigned);

        } catch (Exception e) {
            log.error("Error checking assignment for user {} to case {}: {}",
                    userId, caseId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get assignment statistics for a case
     * Accessible by all authenticated users
     */
    @GetMapping("/{caseId}/assignment-count")
    @PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR')")
    public ResponseEntity<Long> getCaseAssignmentCount(
            @PathVariable UUID caseId,
            Authentication authentication) {

        try {
            long count = caseAssigneeService.getAssignmentCount(caseId);
            return ResponseEntity.ok(count);

        } catch (Exception e) {
            log.error("Error getting assignment count for case {}: {}", caseId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
