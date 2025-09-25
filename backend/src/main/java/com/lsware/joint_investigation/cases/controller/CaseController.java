package com.lsware.joint_investigation.cases.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.lsware.joint_investigation.cases.dto.CreateCaseRequest;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.lsware.joint_investigation.cases.service.CaseService;
import com.lsware.joint_investigation.config.CustomUser;

import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

@RestController
@RequestMapping("/api/cases")
@Slf4j
public class CaseController {

    @Autowired
    private CaseService caseService;

    @PostMapping
    public MappingJacksonValue createCase(@RequestBody CreateCaseRequest request) {
        return caseService.createCase(request);
    }

    @GetMapping
    public MappingJacksonValue getCaseList(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) CASE_STATUS status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
        @RequestParam(required = false, defaultValue = "asc") String sortDirection,
        Authentication authentication
    ) {
        CustomUser user = (CustomUser)authentication.getPrincipal();
        Direction direction = sortDirection.equalsIgnoreCase("desc") ? Direction.DESC : Direction.ASC;
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);

		return caseService.getCaseList(user, name, status, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MappingJacksonValue> getCaseById(@PathVariable UUID id, Authentication authentication) {
        try {
            CustomUser user = (CustomUser)authentication.getPrincipal();
            MappingJacksonValue result = caseService.getCaseById(id, user);
            if (result == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting case record by uuid: {}",
				e.getMessage());
			return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/my-assigned")
    public MappingJacksonValue getMyAssignedCases(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) CASE_STATUS status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
        @RequestParam(required = false, defaultValue = "desc") String sortDirection,
        Authentication authentication
    ) {
        CustomUser user = (CustomUser) authentication.getPrincipal();
        Direction direction = sortDirection.equalsIgnoreCase("desc") ? Direction.DESC : Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return caseService.getAssignedCases(user.getId(), name, status, pageable);
    }
}
