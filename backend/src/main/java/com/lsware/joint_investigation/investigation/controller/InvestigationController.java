
package com.lsware.joint_investigation.investigation.controller;

import com.lsware.joint_investigation.investigation.service.InvestigationService;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.investigation.dto.CreateInvestigationRecordMultipartRequest;
import com.lsware.joint_investigation.investigation.dto.UpdateInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.RejectInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.ApproveInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.RequestReviewInvestigationRecordRequest;
import com.lsware.joint_investigation.investigation.dto.InvestigationRecordDto;
import com.lsware.joint_investigation.user.controller.UserController;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.bind.annotation.GetMapping;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.converter.json.MappingJacksonValue;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/investigation-records")
@Slf4j
public class InvestigationController {

	@Autowired
	private InvestigationService investigationService;

	@GetMapping("/list")
	public MappingJacksonValue getInvestigationRecords(
			@RequestParam(required = false) String recordName,
			@RequestParam(required = false) PROGRESS_STATUS progressStatus,
			@RequestParam(required = false) String caseId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false, defaultValue = "createdAt") String sortBy,
			@RequestParam(required = false, defaultValue = "desc") String sortDirection) {
		Direction direction = sortDirection.equalsIgnoreCase("desc") ? Direction.DESC : Direction.ASC;
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);

		Map<String, Object> result = investigationService.getInvestigationRecords(recordName, progressStatus, caseId,
				pageable);
		MappingJacksonValue mapping = new MappingJacksonValue(result);

		mapping.setFilters(UserController.getUserFilter());

		return mapping;
	}

	/**
	 * Create a new investigation record with file uploads
	 * Handles multipart/form-data requests with files
	 */
	@PostMapping(value = "/create-with-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<MappingJacksonValue> createInvestigationRecordWithFiles(
			@RequestPart("record") CreateInvestigationRecordMultipartRequest request,
			@RequestPart(value = "files", required = false) MultipartFile[] files,
			@RequestParam(value = "fileTypes", required = false) String[] fileTypes,
			@RequestParam(value = "digitalEvidenceFlags", required = false) Boolean[] digitalEvidenceFlags,
			@RequestParam(value = "investigationReportFlags", required = false) Boolean[] investigationReportFlags,
			Authentication authentication) {

		try {
			InvestigationRecordDto createdRecord = investigationService.createInvestigationRecordWithFiles(
					request, files, fileTypes, digitalEvidenceFlags, investigationReportFlags);

			MappingJacksonValue mapping = new MappingJacksonValue(createdRecord);
			mapping.setFilters(UserController.getUserFilter());

			return ResponseEntity.ok(mapping);

		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * Get investigation record by ID
	 */
	@GetMapping("/{recordId}")
	public ResponseEntity<MappingJacksonValue> getInvestigationRecordById(
			@PathVariable UUID recordId,
			Authentication authentication) {

		try {
			InvestigationRecordDto record = investigationService.getInvestigationRecordById(recordId);

			MappingJacksonValue mapping = new MappingJacksonValue(record);
			mapping.setFilters(UserController.getUserFilter());

			return ResponseEntity.ok(mapping);

		} catch (IllegalArgumentException e) {
			log.error("Invalid request for getting investigation record {}: {}",
				recordId, e.getMessage());
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			log.error("Invalid request for getting investigation record {}: {}",
				recordId, e.getMessage());
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * Update an existing investigation record
	 */
	@PutMapping("/{recordId}")
	public ResponseEntity<MappingJacksonValue> updateInvestigationRecord(
			@PathVariable UUID recordId,
			@RequestBody UpdateInvestigationRecordRequest request,
			Authentication authentication) {

		try {
			InvestigationRecordDto updatedRecord = investigationService.updateInvestigationRecord(recordId, request);

			MappingJacksonValue mapping = new MappingJacksonValue(updatedRecord);
			mapping.setFilters(UserController.getUserFilter());

			return ResponseEntity.ok(mapping);

		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * Reject an investigation record
	 */
	@PostMapping("/reject")
	public ResponseEntity<MappingJacksonValue> rejectInvestigationRecord(
			@RequestBody RejectInvestigationRecordRequest request,
			Authentication authentication) {

		try {
			CustomUser user = (CustomUser)authentication.getPrincipal();
			InvestigationRecordDto rejectedRecord = investigationService.rejectInvestigationRecord(request, user.getId());

			MappingJacksonValue mapping = new MappingJacksonValue(rejectedRecord);
			mapping.setFilters(UserController.getUserFilter());

			return ResponseEntity.ok(mapping);

		} catch (IllegalArgumentException e) {
			log.error("Invalid request for rejecting investigation record {}: {}",
				request.getRecordId(), e.getMessage());
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			log.error("Error rejecting investigation record {}: {}",
				request.getRecordId(), e.getMessage());
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * Approve an investigation record
	 */
	@PostMapping("/approve")
	public ResponseEntity<MappingJacksonValue> approveInvestigationRecord(
			@RequestBody ApproveInvestigationRecordRequest request,
			Authentication authentication) {

		try {
			CustomUser user = (CustomUser)authentication.getPrincipal();
			InvestigationRecordDto approvedRecord = investigationService.approveInvestigationRecord(request, user.getId());

			MappingJacksonValue mapping = new MappingJacksonValue(approvedRecord);
			mapping.setFilters(UserController.getUserFilter());

			return ResponseEntity.ok(mapping);

		} catch (IllegalArgumentException e) {
			log.error("Invalid request for approving investigation record {}: {}",
				request.getRecordId(), e.getMessage());
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			log.error("Error approving investigation record {}: {}",
				request.getRecordId(), e.getMessage());
			return ResponseEntity.internalServerError().build();
		}
	}

	/**
	 * Request review for an investigation record
	 */
	@PatchMapping("/requestReview")
	public ResponseEntity<MappingJacksonValue> requestReviewInvestigationRecord(
			@RequestBody RequestReviewInvestigationRecordRequest request,
			Authentication authentication) {

		try {
			CustomUser user = (CustomUser)authentication.getPrincipal();
			InvestigationRecordDto reviewRequestedRecord = investigationService.requestReviewInvestigationRecord(request, user.getId());

			MappingJacksonValue mapping = new MappingJacksonValue(reviewRequestedRecord);
			mapping.setFilters(UserController.getUserFilter());

			return ResponseEntity.ok(mapping);

		} catch (IllegalArgumentException e) {
			log.error("Invalid request for requesting review of investigation record {}: {}",
				request.getRecordId(), e.getMessage());
			return ResponseEntity.badRequest().build();
		} catch (Exception e) {
			log.error("Error requesting review for investigation record {}: {}",
				request.getRecordId(), e.getMessage());
			return ResponseEntity.internalServerError().build();
		}
	}
}
