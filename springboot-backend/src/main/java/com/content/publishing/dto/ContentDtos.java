package com.content.publishing.dto;

import com.content.publishing.entity.ContentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public class ContentDtos {
    public record ContentRequest(
            @NotBlank @Size(max = 180) String title,
            @Size(max = 500) String summary,
            String body,
            List<String> topics
    ) {
    }

    public record ContentResponse(
            Long id,
            String title,
            String summary,
            String body,
            List<String> topics,
            ContentStatus status,
            Integer versionNumber,
            Instant createdAt,
            Instant updatedAt,
            Instant publishedAt
    ) {
    }

    public record VersionResponse(
            Long id,
            Integer versionNumber,
            String title,
            String summary,
            Instant createdAt
    ) {
    }
}
