package com.lsware.joint_investigation.notification.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.notification.dto.NotificationDto;
import com.lsware.joint_investigation.notification.entity.Notification;
import com.lsware.joint_investigation.notification.repository.NotificationRepository;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    NotificationRepository notificationRepository;
    @Autowired
    UserRepository userRepository;

    @GetMapping
    public List<NotificationDto> getUserNotifications() {
        CustomUser currentUser = (CustomUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();

        Users user = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);

        return notifications.stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

}
