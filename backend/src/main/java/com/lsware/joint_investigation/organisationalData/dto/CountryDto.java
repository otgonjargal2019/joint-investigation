package com.lsware.joint_investigation.organisationalData.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Country entity responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CountryDto {

    private Long id;
    private UUID uuid;
    private String name;
    private String phonePrefix;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Simple constructor for basic country information
     */
    public CountryDto(Long id, String name, String code) {
        this.id = id;
        this.name = name;
        this.code = code;
    }

    /**
     * Constructor without timestamps
     */
    public CountryDto(Long id, UUID uuid, String name, String phonePrefix, String code) {
        this.id = id;
        this.uuid = uuid;
        this.name = name;
        this.phonePrefix = phonePrefix;
        this.code = code;
    }
}
