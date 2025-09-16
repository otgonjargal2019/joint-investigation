package com.lsware.joint_investigation.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HeadquarterDto {
    private Long id;
    private UUID uuid;
    private Long countryId;
    private String name;
    private LocalDateTime createdAt;
}
