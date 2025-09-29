package com.lsware.joint_investigation.notification.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.lsware.joint_investigation.notification.util.NotificationUtils;

@Service
public class NotificationService {

    private final WebClient webClient;

    public NotificationService(@Value("${socket.server.url}") String serverUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(serverUrl)
                .build();

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

    // notification bichihdee duudah code
    // Map<String, String> contentMap = new LinkedHashMap<>();
    // contentMap.put("사건번호", "3254");
    // contentMap.put("사건 명", "웹툰 A 무단 복제사건");
    // contentMap.put("변경 일시", "2024-02-09 18:32:44");

    // notificationService.notifyUser(currentUserId, "Test Title", contentMap,
    // "/test-url");

}
