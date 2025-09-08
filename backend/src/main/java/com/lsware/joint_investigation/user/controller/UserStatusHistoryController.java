package com.lsware.joint_investigation.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;

import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.dto.UserDto;

@RestController
@RequestMapping("/api/users")
public class UserStatusHistoryController {

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<MappingJacksonValue> getUsers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) Users.USER_STATUS status) {

        List<Users> users;

        if (status != null) {
            users = userRepository.findByStatus(status, page, size);
        } else {
            users = userRepository.findAll(page, size);
        }

        List<UserDto> dtos = users.stream()
                .map(Users::toDto)
                .collect(Collectors.toList());

        Map<String, Object> meta = new HashMap<>();
        meta.put("currentPage", page);
        meta.put("pageSize", size);
        meta.put("totalItems", dtos.size());
        meta.put("totalPages", (int) Math.ceil((double) dtos.size() / size));
        meta.put("hasNext", dtos.size() == size);
        meta.put("hasPrevious", page > 0);

        ApiResponse<List<UserDto>> response = new ApiResponse<>(
                true,
                "Users retrieved successfully",
                dtos,
                meta);

        MappingJacksonValue mapping = new MappingJacksonValue(response);
        mapping.setFilters(getUserFilter());

        return ResponseEntity.ok(mapping);
    }

    private FilterProvider getUserFilter() {
        SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
                .filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone",
                        "country", "department", "status", "createdAt");

        return new SimpleFilterProvider().addFilter("UserFilter", userFilter);
    }
}
