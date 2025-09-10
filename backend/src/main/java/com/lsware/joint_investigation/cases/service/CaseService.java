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

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import com.lsware.joint_investigation.cases.dto.CaseDto;
import com.lsware.joint_investigation.cases.dto.CreateCaseRequest;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.entity.Case.CASE_STATUS;
import com.lsware.joint_investigation.cases.repository.CaseRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

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

		SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
				.filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone", "country",
						"department", "status");

		FilterProvider filters = new SimpleFilterProvider()
				.addFilter("UserFilter", userFilter);

		mapping.setFilters(filters);

		return mapping;
	}

	@PreAuthorize("hasRole('INV_ADMIN') or hasRole('INVESTIGATOR') or hasRole('RESEARCHER')")
	public MappingJacksonValue getCaseList(UUID userId, String name, CASE_STATUS status, Pageable pageable) {
		Map<String, Object> result = caseRepository.getCaseList(userId, name, status, pageable);

		@SuppressWarnings("unchecked")
		List<Case> records = (List<Case>) result.get("rows");
		List<CaseDto> dtos = records.stream().map(Case::toDto).toList();

		MappingJacksonValue mapping = new MappingJacksonValue(Map.of(
				"rows", dtos,
				"total", result.get("total")));

		SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
				.filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone", "country",
						"department", "status");

		FilterProvider filters = new SimpleFilterProvider()
				.addFilter("UserFilter", userFilter);

		mapping.setFilters(filters);

		return mapping;
	}

	public MappingJacksonValue getCaseById(UUID caseId) {
		// Fetch the case with latest investigation record
		Case caseEntity = caseRepository.findById(caseId)
				.orElseThrow(() -> new RuntimeException("Case not found"));

		CaseDto dto = caseEntity.toDto();

		if (caseEntity.getInvestigationRecords() != null) {
			List<InvestigationRecordDto> records = caseEntity.getInvestigationRecords()
					.stream()
					.map(r -> {
						InvestigationRecordDto rdto = r.toDto();
						rdto.setCaseId(caseEntity.getCaseId()); // avoid recursion
						return rdto;
					})
					.collect(Collectors.toList());
			dto.setInvestigationRecords(records);
		}

		MappingJacksonValue mapping = new MappingJacksonValue(dto);

		SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
				.filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone", "country",
						"department", "status");

		FilterProvider filters = new SimpleFilterProvider()
				.addFilter("UserFilter", userFilter);

		mapping.setFilters(filters);

		return mapping;
	}
}
