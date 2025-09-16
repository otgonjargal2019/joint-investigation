package com.lsware.joint_investigation.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lsware.joint_investigation.user.dto.HeadquarterDto;

@Entity
@Table(name = "headquarter")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Headquarter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public HeadquarterDto toDto() {
        HeadquarterDto dto = new HeadquarterDto();
        dto.setId(this.id);
        dto.setUuid(this.uuid);
        dto.setCountryId(this.country != null ? this.country.getId() : null);
        dto.setName(this.name);
        dto.setCreatedAt(this.createdAt);
        return dto;
    }
}
