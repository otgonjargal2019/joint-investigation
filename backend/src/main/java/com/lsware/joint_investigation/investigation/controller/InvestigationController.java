
package com.lsware.joint_investigation.investigation.controller;

import com.lsware.joint_investigation.investigation.service.InvestigationService;
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
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
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
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false, defaultValue = "caseId") String sortBy,
			@RequestParam(required = false, defaultValue = "asc") String sortDirection
	) {
		Direction direction = sortDirection.equalsIgnoreCase("desc") ? Direction.DESC : Direction.ASC;
		Sort sort = Sort.by(direction, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);

		Map<String, Object> result = investigationService.getInvestigationRecords(recordName, progressStatus, pageable);
		MappingJacksonValue mapping = new MappingJacksonValue(result);

		SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
				.filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone", "country", "department", "status");

		FilterProvider filters = new SimpleFilterProvider()
				.addFilter("UserFilter", userFilter);

		mapping.setFilters(filters);

		return mapping;
	}
}
