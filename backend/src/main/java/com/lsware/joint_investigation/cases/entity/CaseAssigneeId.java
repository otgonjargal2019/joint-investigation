package com.lsware.joint_investigation.cases.entity;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseAssigneeId implements Serializable {
    
    private UUID caseId;
    private UUID userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CaseAssigneeId that = (CaseAssigneeId) o;
        return Objects.equals(caseId, that.caseId) && 
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(caseId, userId);
    }
}
