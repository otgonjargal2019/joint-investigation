package com.lsware.joint_investigation.cases.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lsware.joint_investigation.cases.dto.AssignUsersRequest;
import com.lsware.joint_investigation.cases.dto.CaseAssigneeDto;
import com.lsware.joint_investigation.cases.dto.CaseDto;
import com.lsware.joint_investigation.cases.dto.RemoveAssigneesRequest;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.CaseAssignee;
import com.lsware.joint_investigation.cases.entity.QCase;
import com.lsware.joint_investigation.cases.repository.CaseAssigneeRepository;
import com.lsware.joint_investigation.cases.repository.CaseRepository;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.notification.service.NotificationService;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.querydsl.core.Tuple;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final NotificationService notificationService;

    public List<CaseAssigneeDto> assignUsersToCase(AssignUsersRequest request, CustomUser user) {
        log.info("Assigning {} users to case {}", request.getUserIds().size(), request.getCaseId());

        Tuple caseInstance = caseRepository.findById(request.getCaseId(), user);

        if (caseInstance == null) {
            throw new IllegalArgumentException("Case not found with ID: " + request.getCaseId());
        }

        List<Users> users = userRepository.findByUserIds(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        List<CaseAssignee> assignments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (UUID userId : request.getUserIds()) {

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

        return getCaseAssignees(request.getCaseId(), user);
    }

    public void removeUsersFromCase(RemoveAssigneesRequest request) {
        log.info("Removing {} users from case {}", request.getUserIds().size(), request.getCaseId());

        if (!caseRepository.existsById(request.getCaseId())) {
            throw new IllegalArgumentException("Case not found with ID: " + request.getCaseId());
        }

        caseAssigneeRepository.deleteByCaseIdAndUserIdIn(request.getCaseId(), request.getUserIds());
        log.info("Successfully removed {} users from case {}", request.getUserIds().size(), request.getCaseId());
    }

    @Transactional(readOnly = true)
    public List<CaseAssigneeDto> getCaseAssignees(UUID caseId, CustomUser user) {
        log.debug("Fetching assignees for case {}", caseId);

        List<CaseAssignee> assignments = caseAssigneeRepository.findByCaseIdWithUserDetails(caseId, user.getId());

        if (!assignments.isEmpty()) {
            if (assignments.get(0).getUser() != null) {
                assignments.get(0).getUser().getCountry();
                assignments.get(0).getUser().getHeadquarter();
                assignments.get(0).getUser().getDepartment();
            }
        }

        return assignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

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

    @Transactional(readOnly = true)
    public boolean isUserAssignedToCase(UUID caseId, UUID userId) {
        return caseAssigneeRepository.existsByCaseIdAndUserId(caseId, userId);
    }

    @Transactional(readOnly = true)
    public long getAssignmentCount(UUID caseId) {
        return caseAssigneeRepository.countByCaseId(caseId);
    }

    @Transactional(readOnly = true)
    public long getUserCaseCount(UUID userId) {
        return caseAssigneeRepository.countByUserId(userId);
    }

    public void removeAllAssignmentsForCase(UUID caseId) {
        log.info("Removing all assignments for case {}", caseId);
        caseAssigneeRepository.deleteByCaseId(caseId);
    }

    public List<CaseAssigneeDto> updateCaseAssignments(AssignUsersRequest request, CustomUser user) {
        log.info("Updating all assignments for case {} with {} users",
                request.getCaseId(), request.getUserIds().size());

        Tuple caseInstance = caseRepository.findById(request.getCaseId(), user);
        if (caseInstance == null) {
            throw new IllegalArgumentException("Case not found with ID: " + request.getCaseId());
        }

        Case caseEntity = caseInstance.get(QCase.case$);
        CaseDto caseDto = caseEntity.toDto();

        List<Users> users = userRepository.findByUserIds(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException("One or more users not found");
        }

        Set<UUID> currentAssignees = caseAssigneeRepository
                .findByCaseIdWithUserDetails(request.getCaseId(), user.getId())
                .stream()
                .map(CaseAssignee::getUserId)
                .collect(Collectors.toSet());

        Set<UUID> newAssignees = request.getUserIds().stream()
                .filter(userId -> !currentAssignees.contains(userId))
                .collect(Collectors.toSet());

        Set<UUID> removedAssignees = currentAssignees.stream()
                .filter(userId -> !request.getUserIds().contains(userId))
                .collect(Collectors.toSet());

        caseAssigneeRepository.deleteByCaseId(request.getCaseId());

        List<CaseAssignee> assignments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (UUID userId : request.getUserIds()) {
            CaseAssignee assignment = new CaseAssignee();
            assignment.setCaseId(request.getCaseId());
            assignment.setUserId(userId);
            assignment.setAssignedAt(now);
            assignments.add(assignment);
        }

        List<CaseAssignee> savedAssignments = caseAssigneeRepository.saveAll(assignments);
        log.info("Successfully updated {} assignments for case {}",
                savedAssignments.size(), request.getCaseId());

        for (UUID userId : newAssignees) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                String formattedDateTime = now.format(formatter);
                Map<String, String> contentMap = new LinkedHashMap<>();
                contentMap.put("NOTIFICATION-KEY.CASE-NUMBER", MessageFormat.format("#{0}", caseDto.getNumber()));
                contentMap.put("NOTIFICATION-KEY.CASE-TITLE", caseDto.getCaseName());
                contentMap.put("NOTIFICATION-KEY.ALLOCATION-DATE", formattedDateTime);

                notificationService.notifyUser(
                        userId,
                        "NOTIFICATION-KEY.TITLE.CASE-ASSIGNMENT",
                        contentMap,
                        MessageFormat.format("/investigator/cases/{0}", caseDto.getCaseId().toString()));
            } catch (Exception e) {
                log.error("Failed to send notification to newly assigned user {}: {}", userId, e.getMessage());
            }
        }

        for (UUID userId : removedAssignees) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                String formattedDateTime = now.format(formatter);
                Map<String, String> contentMap = new LinkedHashMap<>();
                contentMap.put("NOTIFICATION-KEY.CASE-NUMBER", MessageFormat.format("#{0}", caseDto.getNumber()));
                contentMap.put("NOTIFICATION-KEY.CASE-TITLE", caseDto.getCaseName());
                contentMap.put("NOTIFICATION-KEY.DEALLOCATION-DATE", formattedDateTime);

                notificationService.notifyUser(
                        userId,
                        "NOTIFICATION-KEY.TITLE.CASE-DEALLOCATION",
                        contentMap,
                        "/investigator/cases");
            } catch (Exception e) {
                log.error("Failed to send notification to newly unassigned user {}: {}", userId, e.getMessage());
            }
        }

        return getCaseAssignees(request.getCaseId(), user);
    }

    private CaseAssigneeDto convertToDto(CaseAssignee assignment) {
        CaseAssigneeDto dto = CaseAssigneeDto.builder()
                .caseId(assignment.getCaseId())
                .userId(assignment.getUserId())
                .assignedAt(assignment.getAssignedAt())
                .build();

        if (assignment.getUser() != null) {
            dto.setUser(assignment.getUser().toDto());
        }

        return dto;
    }
}
