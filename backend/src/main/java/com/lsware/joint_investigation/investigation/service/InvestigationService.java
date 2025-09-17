package com.lsware.joint_investigation.investigation.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import com.lsware.joint_investigation.investigation.repository.InvestigationRecordRepository;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import com.lsware.joint_investigation.investigation.dto.CreateInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.UpdateInvestigationRecordRequest;
import com.lsware.joint_investigation.cases.entity.Case;
import com.lsware.joint_investigation.cases.repository.CaseRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.config.CustomUser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

@Service
public class InvestigationService {
	@Autowired
	private InvestigationRecordRepository investigationRecordRepository;

	@Autowired
	private CaseRepository caseRepository;

	@Autowired
	private UserRepository userRepository;

	public Map<String, Object> getInvestigationRecords(String recordName, PROGRESS_STATUS progressStatus, String caseId, Pageable pageable) {
		Map<String, Object> result = investigationRecordRepository.findInvestigationRecord(recordName, progressStatus, caseId, pageable);

		@SuppressWarnings("unchecked")
		List<InvestigationRecord> records = (List<InvestigationRecord>) result.get("rows");
		List<InvestigationRecordDto> dtos = records.stream()
			.map(InvestigationRecord::toDto)
			.toList();

		return Map.of(
			"rows", dtos,
			"total", result.get("total")
		);
	}

	/**
	 * Create a new investigation record
	 * @param request The create investigation record request
	 * @return The created investigation record DTO
	 */
	@PreAuthorize("hasRole('RESEARCHER') or hasRole('INVESTIGATOR')")
	@Transactional
	public InvestigationRecordDto createInvestigationRecord(CreateInvestigationRecordRequest request) {
		// Validate request
		if (request.getCaseId() == null) {
			throw new IllegalArgumentException("Case ID is required");
		}
		if (request.getRecordName() == null || request.getRecordName().trim().isEmpty()) {
			throw new IllegalArgumentException("Record name is required");
		}
		if (request.getSecurityLevel() == null) {
			throw new IllegalArgumentException("Security level is required");
		}

		// Get current user
		CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID currentUserId = currentUser.getId();

		// Validate and get the case
		Case caseEntity = caseRepository.findById(request.getCaseId())
				.orElseThrow(() -> new IllegalArgumentException("Case not found with ID: " + request.getCaseId()));

		// Get the creator user
		Users creator = userRepository.findByUserId(currentUserId)
				.orElseThrow(() -> new RuntimeException("Creator user not found"));

		// Get reviewer if specified
		Users reviewer = null;
		if (request.getReviewerId() != null) {
			reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException("Reviewer not found with ID: " + request.getReviewerId()));
		}

		// Create the investigation record entity
		InvestigationRecord record = new InvestigationRecord();
		record.setCaseInstance(caseEntity);
		record.setRecordName(request.getRecordName());
		record.setContent(request.getContent());
		record.setSecurityLevel(request.getSecurityLevel());
		record.setNumber(request.getNumber());
		record.setProgressStatus(request.getProgressStatus() != null ? request.getProgressStatus() : PROGRESS_STATUS.PRE_INVESTIGATION);
		record.setReviewStatus(request.getReviewStatus() != null ? request.getReviewStatus() : InvestigationRecord.REVIEW_STATUS.WRITING);
		record.setRejectionReason(request.getRejectionReason());
		record.setCreator(creator);
		record.setReviewer(reviewer);
		
		// Set timestamps
		LocalDateTime now = LocalDateTime.now();
		record.setCreatedAt(now);
		record.setUpdatedAt(now);

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(record);

		// Update case updated_at timestamp
		caseEntity.setUpdatedAt(now);
		caseRepository.save(caseEntity);

		// Return DTO
		return savedRecord.toDto();
	}

	/**
	 * Get investigation record by ID
	 * @param recordId The investigation record ID
	 * @return The investigation record DTO
	 */
	@PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR')")
	public InvestigationRecordDto getInvestigationRecordById(UUID recordId) {
		InvestigationRecord record = investigationRecordRepository.findById(recordId.toString())
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));
		return record.toDto();
	}

	/**
	 * Update an existing investigation record
	 * @param recordId The investigation record ID
	 * @param request The update request
	 * @return The updated investigation record DTO
	 */
	@PreAuthorize("hasRole('INV_ADMIN') or hasRole('PLATFORM_ADMIN') or hasRole('INVESTIGATOR')")
	@Transactional
	public InvestigationRecordDto updateInvestigationRecord(UUID recordId, UpdateInvestigationRecordRequest request) {
		// Get the existing record
		InvestigationRecord existingRecord = investigationRecordRepository.findById(recordId.toString())
				.orElseThrow(() -> new IllegalArgumentException("Investigation record not found with ID: " + recordId));

		// Validate request
		if (request.getRecordName() != null && !request.getRecordName().trim().isEmpty()) {
			existingRecord.setRecordName(request.getRecordName());
		}
		if (request.getContent() != null) {
			existingRecord.setContent(request.getContent());
		}
		if (request.getSecurityLevel() != null && request.getSecurityLevel() != null) {
			existingRecord.setSecurityLevel(request.getSecurityLevel());
		}
		if (request.getNumber() != null) {
			existingRecord.setNumber(request.getNumber());
		}
		if (request.getProgressStatus() != null) {
			existingRecord.setProgressStatus(request.getProgressStatus());
		}
		if (request.getReviewStatus() != null) {
			existingRecord.setReviewStatus(request.getReviewStatus());
		}
		if (request.getRejectionReason() != null) {
			existingRecord.setRejectionReason(request.getRejectionReason());
		}

		// Update reviewer if specified
		if (request.getReviewerId() != null) {
			Users reviewer = userRepository.findByUserId(request.getReviewerId())
					.orElseThrow(() -> new IllegalArgumentException("Reviewer not found with ID: " + request.getReviewerId()));
			existingRecord.setReviewer(reviewer);
		}

		// Update timestamp
		existingRecord.setUpdatedAt(LocalDateTime.now());

		// Save the record
		InvestigationRecord savedRecord = investigationRecordRepository.save(existingRecord);

		// Update case updated_at timestamp
		if (existingRecord.getCaseInstance() != null) {
			Case caseEntity = existingRecord.getCaseInstance();
			caseEntity.setUpdatedAt(LocalDateTime.now());
			caseRepository.save(caseEntity);
		}

		// Return DTO
		return savedRecord.toDto();
	}
}
