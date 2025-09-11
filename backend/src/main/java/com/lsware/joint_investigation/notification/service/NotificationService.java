package com.lsware.joint_investigation.notification.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class NotificationService {

    private final WebClient webClient;

    public NotificationService(@Value("${socket.server.url}") String serverUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(serverUrl)
                .build();
    }

    public void notifyUser(UUID userId, String title, String content, String relatedUrl) {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("title", title);
        body.put("content", content);
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

}
