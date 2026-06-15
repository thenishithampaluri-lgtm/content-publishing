package com.content.publishing.repository;

import com.content.publishing.entity.EditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EditLogRepository extends JpaRepository<EditLog, Long> {
}
