
package com.lsware.joint_investigation.investigation.controller;

import com.lsware.joint_investigation.investigation.service.InvestigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/investigation-records")
public class InvestigationController {

	@Autowired
	private InvestigationService investigationService;

	@GetMapping("/list")
	public ResponseEntity<?> getInvestigationRecords(
			@RequestParam(required = false) String recordName,
			@RequestParam(required = false) PROGRESS_STATUS progressStatus,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false, defaultValue = "caseInstance.caseId") String sortBy,
			@RequestParam(required = false, defaultValue = "asc") String sortDirection
	) {
		Direction direction = sortDirection.equalsIgnoreCase("desc") ? Direction.DESC : Direction.ASC;
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);
		return ResponseEntity.ok(investigationService.getInvestigationRecords(recordName, progressStatus, pageable));
	}
}
