
package com.lsware.joint_investigation.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lsware.joint_investigation.user.dto.CountryDto;

@Entity
@Table(name = "country")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "phone_prefix", length = 10)
    private String phonePrefix;

    @Column(name = "code", length = 10, nullable = false, unique = true)
    private String code;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public CountryDto toDto() {
        CountryDto dto = new CountryDto();
        dto.setId(this.id);
        dto.setUuid(this.uuid);
        dto.setName(this.name);
        dto.setPhonePrefix(this.phonePrefix);
        dto.setCode(this.code);
        dto.setCreatedAt(this.createdAt);
        return dto;
    }
}
