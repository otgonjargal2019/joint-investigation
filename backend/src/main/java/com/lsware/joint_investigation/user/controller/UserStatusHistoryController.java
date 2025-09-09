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

}
