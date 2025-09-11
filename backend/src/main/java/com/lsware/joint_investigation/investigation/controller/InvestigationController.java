
package com.lsware.joint_investigation.investigation.controller;

import com.lsware.joint_investigation.investigation.service.InvestigationService;
import com.lsware.joint_investigation.user.controller.UserController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import org.springframework.web.bind.annotation.GetMapping;
import com.lsware.joint_investigation.investigation.entity.InvestigationRecord.PROGRESS_STATUS;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.converter.json.MappingJacksonValue;
import java.util.Map;


@RestController
@RequestMapping("/investigation-records")
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
			@RequestParam(required = false, defaultValue = "recordName") String sortBy,
			@RequestParam(required = false, defaultValue = "asc") String sortDirection
	) {
		Direction direction = sortDirection.equalsIgnoreCase("desc") ? Direction.DESC : Direction.ASC;
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);

		Map<String, Object> result = investigationService.getInvestigationRecords(recordName, progressStatus, caseId, pageable);
		MappingJacksonValue mapping = new MappingJacksonValue(result);

		mapping.setFilters(UserController.getUserFilter());

		return mapping;
	}
}
