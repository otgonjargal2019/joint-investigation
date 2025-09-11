package com.lsware.joint_investigation.notification.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import lombok.Data;
import lombok.NoArgsConstructor;

import com.lsware.joint_investigation.notification.entity.Notification;

@Data
@NoArgsConstructor
public class NotificationDto {
    private UUID notificationId;
    private String title;
    private String content;
    private String relatedUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String createdAtFormated;

    public static NotificationDto fromEntity(Notification entity) {
        NotificationDto dto = new NotificationDto();
        dto.setNotificationId(entity.getNotificationId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setRelatedUrl(entity.getRelatedUrl());
        dto.setIsRead(entity.getIsRead());
        dto.setCreatedAt(entity.getCreatedAt());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        dto.setCreatedAtFormated(entity.getCreatedAt().format(formatter));

        return dto;
    }

}
