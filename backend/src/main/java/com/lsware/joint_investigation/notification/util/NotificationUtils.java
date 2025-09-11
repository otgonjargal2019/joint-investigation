package com.lsware.joint_investigation.notification.util;

import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class NotificationUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String toStructuredContent(Map<String, String> contentMap) {
        try {
            return objectMapper.writeValueAsString(contentMap);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert content map to JSON", e);
        }
    }
}
