package com.lsware.joint_investigation.cases.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.lsware.joint_investigation.cases.entity.Case;

@Repository
public interface CaseRepository extends JpaRepository<Case, UUID> {
}
