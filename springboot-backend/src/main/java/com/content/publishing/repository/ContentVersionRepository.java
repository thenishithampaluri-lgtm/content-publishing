package com.content.publishing.repository;

import com.content.publishing.entity.ContentVersion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentVersionRepository extends JpaRepository<ContentVersion, Long> {
    List<ContentVersion> findByContentIdOrderByVersionNumberDesc(Long contentId);
}
