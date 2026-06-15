package com.content.publishing.repository;

import com.content.publishing.entity.Draft;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DraftRepository extends JpaRepository<Draft, Long> {
    Optional<Draft> findByContentId(Long contentId);
}
