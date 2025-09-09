package com.lsware.joint_investigation.user.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.user.repository.UserStatusHistoryRepository;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.user.entity.UserStatusHistory;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.dto.UserStatusHistoryDto;

@RestController
@RequestMapping("/api/user-status-histories")
public class UserStatusHistoryController {

        @Autowired
        UserRepository userRepository;

        @Autowired
        UserStatusHistoryRepository userStatusHistoryRepository;

        @PostMapping
        public ResponseEntity<ApiResponse<UUID>> createStatusHistory(
                        @RequestBody UserStatusHistoryDto request) {

                if (request.getUserId() == null) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "userId must not be null", null, null));
                }

                Users user = userRepository.findByUserId(request.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext()
                                .getAuthentication().getPrincipal();

                Users creator = userRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new RuntimeException("Creator user not found"));

                UserStatusHistory history = new UserStatusHistory();
                history.setUser(user);
                history.setCreator(creator);
                history.setFromStatus(request.getFromStatus());
                history.setToStatus(request.getToStatus());
                history.setReason(request.getReason());

                UserStatusHistory saved = userStatusHistoryRepository.save(history);

                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Status history created successfully", saved.getHistoryId(),
                                                null));
        }

}
