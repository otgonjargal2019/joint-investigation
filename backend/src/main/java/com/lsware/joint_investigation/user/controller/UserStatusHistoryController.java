package com.lsware.joint_investigation.user.controller;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.user.dto.UserStatusHistoryDto;
import com.lsware.joint_investigation.user.entity.UserStatusHistory;
import com.lsware.joint_investigation.user.entity.Users.USER_STATUS;
import com.lsware.joint_investigation.user.repository.CountryRepository;
import com.lsware.joint_investigation.user.repository.DepartmentRepository;
import com.lsware.joint_investigation.user.repository.HeadquarterRepository;
import com.lsware.joint_investigation.user.repository.UserStatusHistoryRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-status-histories")
@RequiredArgsConstructor
public class UserStatusHistoryController {

    @Autowired
    UserStatusHistoryRepository historyRepository;

    @Autowired
    CountryRepository countryRepository;

    @Autowired
    HeadquarterRepository headquarterRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @GetMapping("/last-waiting-change")
    public ResponseEntity<MappingJacksonValue> getLastWaitingChange(
            @RequestParam UUID userId) {

        UserStatusHistory history = historyRepository
                .findFirstByUser_UserIdAndFromStatusAndToStatusOrderByCreatedAtDesc(
                        userId,
                        USER_STATUS.APPROVED,
                        USER_STATUS.WAITING_TO_CHANGE)
                .orElse(null);

        if (history == null) {
            return ResponseEntity.ok(
                    new MappingJacksonValue(new ApiResponse<>(true, "No history found", null, null)));
        }

        Map<Long, String> countryMap = countryRepository.findAll()
                .stream().collect(Collectors.toMap(c -> c.getId(), c -> c.getName()));
        Map<Long, String> departmentMap = departmentRepository.findAll()
                .stream().collect(Collectors.toMap(d -> d.getId(), d -> d.getName()));
        Map<Long, String> headquarterMap = headquarterRepository.findAll()
                .stream().collect(Collectors.toMap(h -> h.getId(), h -> h.getName()));

        UserStatusHistoryDto dto = new UserStatusHistoryDto();
        dto.setUserId(history.getUser().getUserId());
        dto.setLoginId(history.getUser().getLoginId());
        dto.setNameEn(history.getUser().getNameEn());
        dto.setNameKr(history.getUser().getNameKr());
        dto.setRole(history.getUser().getRole());

        dto.setCountryName(countryMap.get(history.getUser().getCountryId()));
        dto.setDepartmentName(departmentMap.get(history.getDepartmentId()));
        dto.setHeadquarterName(headquarterMap.get(history.getHeadquarterId()));

        dto.setEmail(history.getEmail());
        dto.setPhone(history.getPhone());
        dto.setProfileImageUrl(history.getProfileImageUrl());

        ApiResponse<UserStatusHistoryDto> response = new ApiResponse<>(true, "Last history fetched successfully", dto,
                null);

        MappingJacksonValue mapping = new MappingJacksonValue(response);
        mapping.setFilters(getHistoryFilter());

        return ResponseEntity.ok(mapping);
    }

    private FilterProvider getHistoryFilter() {
        SimpleBeanPropertyFilter historyFilter = SimpleBeanPropertyFilter
                .filterOutAllExcept("id", "fromStatus", "toStatus", "reason", "userId", "creatorId");

        return new SimpleFilterProvider().addFilter("HistoryFilter", historyFilter);
    }

}
