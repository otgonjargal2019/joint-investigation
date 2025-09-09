package com.lsware.joint_investigation.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;

import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.user.repository.UserStatusHistoryRepository;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.user.entity.UserStatusHistory;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.dto.UserDto;
import com.lsware.joint_investigation.user.dto.UserStatusHistoryDto;

@RestController
@RequestMapping("/api/users")
public class UserStatusHistoryController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserStatusHistoryRepository userStatusHistoryRepository;

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

    @GetMapping("/{id}")
    public ResponseEntity<MappingJacksonValue> getUserById(@PathVariable UUID id) {
        return userRepository.findByUserId(id)
                .map(user -> {
                    UserDto dto = user.toDto();
                    ApiResponse<UserDto> response = new ApiResponse<>(
                            true,
                            "User retrieved successfully",
                            dto,
                            null);
                    MappingJacksonValue mapping = new MappingJacksonValue(response);
                    mapping.setFilters(getUserFilter());
                    return ResponseEntity.ok(mapping);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserStatusHistory>> createStatusHistory(
            @RequestBody UserStatusHistoryDto request) {

        Users user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Users creator = userRepository.findByUserId(request.getCreatedBy())
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));

        UserStatusHistory history = new UserStatusHistory();
        history.setUser(user);
        history.setCreator(creator);
        history.setFromStatus(request.getFromStatus());
        history.setToStatus(request.getToStatus());
        history.setReason(request.getReason());

        UserStatusHistory saved = userStatusHistoryRepository.save(history);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Status history created successfully", saved, null));
    }

    private FilterProvider getUserFilter() {
        SimpleBeanPropertyFilter userFilter = SimpleBeanPropertyFilter
                .filterOutAllExcept("userId", "role", "loginId", "nameKr", "nameEn", "email", "phone",
                        "country", "department", "status", "createdAt");

        return new SimpleFilterProvider().addFilter("UserFilter", userFilter);
    }

}
