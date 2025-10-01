package com.lsware.joint_investigation.cases.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.investigation.entity.QInvestigationRecord;
import com.lsware.joint_investigation.cases.dto.CaseDto;
import com.lsware.joint_investigation.cases.dto.CreateCaseRequest;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.lsware.joint_investigation.cases.entity.QCase;
import com.lsware.joint_investigation.cases.repository.CaseRepository;
import com.lsware.joint_investigation.user.controller.UserController;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.querydsl.core.Tuple;

@Service
public class CaseService {

	@Autowired
	private CaseRepository caseRepository;

	@Autowired
	private UserRepository userRepository;

	@PreAuthorize("hasRole('INV_ADMIN')")
	@Transactional
	public MappingJacksonValue createCase(CreateCaseRequest request) {
		CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID currentUserId = currentUser.getId();
		Users creator = userRepository.findByUserId(currentUserId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		Case caseToSave = null;
		if (request.getCaseId() != null) {
			caseToSave = caseRepository.findById(UUID.fromString(request.getCaseId()))
					.orElseThrow(() -> new RuntimeException("Parent case not found"));
		} else {
			caseToSave = new Case();
		}
		caseToSave.setCaseName(request.getCaseName());
		caseToSave.setCaseOutline(request.getCaseOutline());
		caseToSave.setContentType(request.getContentType());
		caseToSave.setInfringementType(request.getInfringementType());
		caseToSave.setRelatedCountries(request.getRelatedCountries());
		caseToSave.setPriority(request.getPriority());
		caseToSave.setStatus(CASE_STATUS.OPEN);
		caseToSave.setInvestigationDate(request.getInvestigationDate());
		caseToSave.setCreator(creator);
		caseToSave.setCreatedAt(LocalDateTime.now());
		caseToSave.setUpdatedAt(LocalDateTime.now());
		caseToSave.setEtc(request.getEtc());

		Case savedCase = caseRepository.save(caseToSave);
		CaseDto caseDto = savedCase.toDto();

		MappingJacksonValue mapping = new MappingJacksonValue(caseDto);

		mapping.setFilters(UserController.getUserFilter());

		return mapping;
	}

	@PreAuthorize("hasRole('INV_ADMIN')")
	public MappingJacksonValue getCaseList(CustomUser user, String name, CASE_STATUS status, Pageable pageable) {
		Map<String, Object> result = caseRepository.getCaseList(user, name, status, pageable);

		@SuppressWarnings("unchecked")
		List<Case> records = (List<Case>) result.get("rows");
		List<CaseDto> dtos = records.stream().map(Case::toDto).toList();

		MappingJacksonValue mapping = new MappingJacksonValue(Map.of(
				"rows", dtos,
				"total", result.get("total")));

		mapping.setFilters(UserController.getUserFilter());

		return mapping;
	}

	public MappingJacksonValue getCaseById(UUID caseId, CustomUser user) throws RuntimeException {

		Tuple caseEntity = caseRepository.findById(caseId, user);

		if (caseEntity != null) {
			caseEntity.get(QCase.case$).setLatestRecord(caseEntity.get(QInvestigationRecord.investigationRecord));
			CaseDto dto = caseEntity.get(QCase.case$).toDto();

			MappingJacksonValue mapping = new MappingJacksonValue(dto);

			mapping.setFilters(UserController.getUserFilter());

			return mapping;
		}

		return null;
	}

	@PreAuthorize("hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	public MappingJacksonValue getAssignedCases(CustomUser user, String name, CASE_STATUS status, Pageable pageable) {
		var casePage = caseRepository.findAssignedCases(user.getId(), name, status, pageable);
		List<Case> recentCases = caseRepository.findRecentAssignedCases(user);

		var caseDtos = casePage.getContent().stream()
				.map(Case::toDto)
				.collect(Collectors.toList());

		Map<String, Object> response = Map.of(
				"recentCases", recentCases.stream().map(Case::toDto).collect(Collectors.toList()),
				"rows", caseDtos,
				"total", casePage.getTotalElements(),
				"totalPages", casePage.getTotalPages(),
				"size", casePage.getSize(),
				"number", casePage.getNumber());

		MappingJacksonValue mapping = new MappingJacksonValue(response);

		mapping.setFilters(UserController.getUserFilter());

		return mapping;
	}
}
