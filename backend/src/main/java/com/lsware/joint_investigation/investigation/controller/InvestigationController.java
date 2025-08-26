
package com.lsware.joint_investigation.investigation.controller;

import com.lsware.joint_investigation.investigation.service.InvestigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/investigation-records")
public class InvestigationController {

	private final InvestigationService investigationService;

	@Autowired
	public InvestigationController(InvestigationService investigationService) {
		this.investigationService = investigationService;
	}

	@GetMapping("")
	public ResponseEntity<?> getInvestigationRecords(
			@RequestParam(required = false) String recordName,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size
	) {
		Pageable pageable = PageRequest.of(page, size);
		return ResponseEntity.ok(investigationService.getInvestigationRecords(recordName, pageable));
	}
}
