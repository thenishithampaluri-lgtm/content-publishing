package com.content.publishing.repository;

import com.content.publishing.entity.Content;
import com.content.publishing.entity.ContentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContentRepository extends JpaRepository<Content, Long> {
    Optional<Content> findByIdAndAuthorId(Long id, Long authorId);

    List<Content> findByAuthorIdOrderByUpdatedAtDesc(Long authorId);

    List<Content> findByStatusOrderByPublishedAtDesc(ContentStatus status);

    @Query("""
            select distinct c from Content c
            left join c.topics t
            where c.author.id = :authorId
            and (:status is null or c.status = :status)
            and (
                :query = ''
                or lower(c.title) like lower(concat('%', :query, '%'))
                or lower(c.summary) like lower(concat('%', :query, '%'))
                or lower(c.body) like lower(concat('%', :query, '%'))
                or lower(t) like lower(concat('%', :query, '%'))
            )
            order by c.updatedAt desc
            """)
    List<Content> searchOwnedContent(@Param("authorId") Long authorId, @Param("query") String query, @Param("status") ContentStatus status);
}
