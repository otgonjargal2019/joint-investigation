package com.lsware.joint_investigation.notification.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.common.dto.ApiResponse;
import com.lsware.joint_investigation.user.repository.UserRepository;
import com.lsware.joint_investigation.notification.dto.NotificationDto;
import com.lsware.joint_investigation.notification.service.NotificationService;
import com.lsware.joint_investigation.notification.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

        @Autowired
        NotificationRepository notificationRepository;
        @Autowired
        UserRepository userRepository;
        @Autowired
        private NotificationService notificationService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<NotificationDto>>> getUserNotifications() {
                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID currentUserId = currentUser.getId();

                Users user = userRepository.findByUserId(currentUserId)
                                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

                // notification bichihdee duudah code
                // Map<String, String> contentMap = new LinkedHashMap<>();
                // contentMap.put("사건번호", "3254");
                // contentMap.put("사건 명", "웹툰 A 무단 복제사건");
                // contentMap.put("변경 일시", "2024-02-09 18:32:44");

                // notificationService.notifyUser(currentUserId, "Test Title", contentMap,
                // "/test-url");

                List<NotificationDto> notifications = notificationService.getUserNotifications(user);
                ApiResponse<List<NotificationDto>> response = new ApiResponse<>(
                                true,
                                "User notifications fetched successfully",
                                notifications,
                                null);

                return ResponseEntity.ok(response);

        }

        @DeleteMapping("/delete-all")
        public ResponseEntity<ApiResponse<Void>> deleteAllNotifications() {
                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID currentUserId = currentUser.getId();

                Users user = userRepository.findByUserId(currentUserId)
                                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

                notificationService.deleteAllByUser(user);

                ApiResponse<Void> response = new ApiResponse<>(
                                true,
                                "Notifications deleted successfully",
                                null,
                                null);
                return ResponseEntity.ok(response);
        }

        @PostMapping("/read-all")
        public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
                CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID currentUserId = currentUser.getId();

                Users user = userRepository.findByUserId(currentUserId)
                                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

                notificationService.markAllAsRead(user);

                ApiResponse<Void> response = new ApiResponse<>(
                                true,
                                "All notifications marked as read",
                                null,
                                null);
                return ResponseEntity.ok(response);
        }

}
