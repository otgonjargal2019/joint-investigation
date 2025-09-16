package com.lsware.joint_investigation.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lsware.joint_investigation.user.dto.DepartmentDto;

@Entity
@Table(name = "department")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "headquarter_id", nullable = false)
    private Headquarter headquarter;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public DepartmentDto toDto() {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(this.id);
        dto.setUuid(this.uuid);
        dto.setCountryId(this.country != null ? this.country.getId() : null);
        dto.setHeadquarterId(this.headquarter != null ? this.headquarter.getId() : null);
        dto.setName(this.name);
        dto.setCreatedAt(this.createdAt);
        return dto;
    }
}
