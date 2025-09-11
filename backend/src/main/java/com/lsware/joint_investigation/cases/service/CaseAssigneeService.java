package com.lsware.joint_investigation.cases.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lsware.joint_investigation.cases.dto.AssignUsersRequest;
import com.lsware.joint_investigation.cases.dto.CaseAssigneeDto;
import com.lsware.joint_investigation.cases.dto.RemoveAssigneesRequest;
import com.lsware.joint_investigation.cases.entity.CaseAssignee;
import com.lsware.joint_investigation.cases.repository.CaseAssigneeRepository;
import com.lsware.joint_investigation.cases.repository.CaseRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CaseAssigneeService {

    private final CaseAssigneeRepository caseAssigneeRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;

    /**
     * Assign users to a case
     */
    public List<CaseAssigneeDto> assignUsersToCase(AssignUsersRequest request) {
        log.info("Assigning {} users to case {}", request.getUserIds().size(), request.getCaseId());

        // Validate case exists
        caseRepository.findById(request.getCaseId())
                .orElseThrow(() -> new IllegalArgumentException("Case not found with ID: " + request.getCaseId()));

        // Validate users exist
        List<Users> users = userRepository.findByUserIds(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        List<CaseAssignee> assignments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (UUID userId : request.getUserIds()) {
            // Check if user is already assigned to this case
            if (!caseAssigneeRepository.existsByCaseIdAndUserId(request.getCaseId(), userId)) {
                CaseAssignee assignment = CaseAssignee.builder()
                        .caseId(request.getCaseId())
                        .userId(userId)
                        .assignedAt(now)
                        .build();
                assignments.add(assignment);
            } else {
                log.warn("User {} is already assigned to case {}", userId, request.getCaseId());
            }
        }

        if (!assignments.isEmpty()) {
            assignments = caseAssigneeRepository.saveAll(assignments);
            log.info("Successfully assigned {} users to case {}", assignments.size(), request.getCaseId());
        }

        // Return the current assignments for the case
        return getCaseAssignees(request.getCaseId());
    }

    /**
     * Remove user assignments from a case
     */
    public void removeUsersFromCase(RemoveAssigneesRequest request) {
        log.info("Removing {} users from case {}", request.getUserIds().size(), request.getCaseId());

        // Validate case exists
        if (!caseRepository.existsById(request.getCaseId())) {
            throw new IllegalArgumentException("Case not found with ID: " + request.getCaseId());
        }

        caseAssigneeRepository.deleteByCaseIdAndUserIdIn(request.getCaseId(), request.getUserIds());
        log.info("Successfully removed {} users from case {}", request.getUserIds().size(), request.getCaseId());
    }

    /**
     * Get all users assigned to a case
     */
    @Transactional(readOnly = true)
    public List<CaseAssigneeDto> getCaseAssignees(UUID caseId) {
        log.debug("Fetching assignees for case {}", caseId);

        List<CaseAssignee> assignments = caseAssigneeRepository.findByCaseIdWithUserDetails(caseId);

        return assignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all cases assigned to a user
     */
    @Transactional(readOnly = true)
    public List<CaseAssigneeDto> getUserAssignments(UUID userId) {
        log.debug("Fetching case assignments for user {}", userId);

        List<CaseAssignee> assignments = caseAssigneeRepository.findByUserIdWithCaseDetails(userId);

        return assignments.stream()
                .map(assignment -> {
                    CaseAssigneeDto dto = convertToDto(assignment);
                    if (assignment.getCaseInstance() != null) {
                        dto.setCaseName(assignment.getCaseInstance().getCaseName());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Check if a user is assigned to a case
     */
    @Transactional(readOnly = true)
    public boolean isUserAssignedToCase(UUID caseId, UUID userId) {
        return caseAssigneeRepository.existsByCaseIdAndUserId(caseId, userId);
    }

    /**
     * Get assignment count for a case
     */
    @Transactional(readOnly = true)
    public long getAssignmentCount(UUID caseId) {
        return caseAssigneeRepository.countByCaseId(caseId);
    }

    /**
     * Get case count for a user
     */
    @Transactional(readOnly = true)
    public long getUserCaseCount(UUID userId) {
        return caseAssigneeRepository.countByUserId(userId);
    }

    /**
     * Remove all assignments for a case (used when deleting a case)
     */
    public void removeAllAssignmentsForCase(UUID caseId) {
        log.info("Removing all assignments for case {}", caseId);
        caseAssigneeRepository.deleteByCaseId(caseId);
    }

    /**
     * Update all assignments for a case (replace existing assignments)
     */
    public List<CaseAssigneeDto> updateCaseAssignments(AssignUsersRequest request) {
        log.info("Updating all assignments for case {} with {} users",
                request.getCaseId(), request.getUserIds().size());

        // Validate case exists
        caseRepository.findById(request.getCaseId())
                .orElseThrow(() -> new IllegalArgumentException("Case not found with ID: " + request.getCaseId()));

        // Validate users exist
        List<Users> users = userRepository.findByUserIds(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        // Remove all existing assignments for this case
        caseAssigneeRepository.deleteByCaseId(request.getCaseId());

        // Create new assignments
        List<CaseAssignee> assignments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (UUID userId : request.getUserIds()) {
            CaseAssignee assignment = new CaseAssignee();
            assignment.setCaseId(request.getCaseId());
            assignment.setUserId(userId);
            assignment.setAssignedAt(now);
            assignments.add(assignment);
        }

        // Save all assignments
        List<CaseAssignee> savedAssignments = caseAssigneeRepository.saveAll(assignments);
        log.info("Successfully updated {} assignments for case {}",
                savedAssignments.size(), request.getCaseId());

        // Fetch assignments with user details for return
        return getCaseAssignees(request.getCaseId());
    }

    /**
     * Convert CaseAssignee entity to DTO
     */
    private CaseAssigneeDto convertToDto(CaseAssignee assignment) {
        CaseAssigneeDto dto = CaseAssigneeDto.builder()
                .caseId(assignment.getCaseId())
                .userId(assignment.getUserId())
                .user(assignment.getUser().toDto())
                .assignedAt(assignment.getAssignedAt())
                .build();

        if (assignment.getUser() != null) {
            dto.setUser(assignment.getUser().toDto());
        }

        return dto;
    }
}
