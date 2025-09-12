package com.lsware.joint_investigation.notification.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.transaction.Transactional;

import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.notification.dto.NotificationDto;
import com.lsware.joint_investigation.notification.entity.Notification;
import com.lsware.joint_investigation.notification.util.NotificationUtils;
import com.lsware.joint_investigation.notification.repository.NotificationRepository;

@Service
public class NotificationService {

    private final WebClient webClient;
    private final NotificationRepository notificationRepository;

    public NotificationService(@Value("${socket.server.url}") String serverUrl,
            NotificationRepository notificationRepository) {
        this.webClient = WebClient.builder()
                .baseUrl(serverUrl)
                .build();
        this.notificationRepository = notificationRepository;
    }

    public void notifyUser(UUID userId, String title, Map<String, String> contentMap, String relatedUrl) {
        String structuredContent = NotificationUtils.toStructuredContent(contentMap);

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("title", title);
        body.put("content", structuredContent);
        body.put("relatedUrl", relatedUrl);

        webClient.post()
                .uri("/notify-user")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnError(err -> {
                    System.err.println("Failed to send notification: " + err.getMessage());
                })
                .subscribe(); // fire-and-forget
    }

    public List<NotificationDto> getUserNotifications(Users user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAllByUser(Users user) {
        notificationRepository.deleteAllByUser(user);
    }

    @Transactional
    public void markAllAsRead(Users user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

}
