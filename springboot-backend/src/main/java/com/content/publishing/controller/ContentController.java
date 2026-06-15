package com.content.publishing.controller;

import com.content.publishing.dto.ContentDtos.ContentRequest;
import com.content.publishing.dto.ContentDtos.ContentResponse;
import com.content.publishing.dto.ContentDtos.VersionResponse;
import com.content.publishing.service.ContentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content")
public class ContentController {
    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/search")
    public List<ContentResponse> search(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "ALL") String status
    ) {
        return contentService.search(userId, q, status);
    }

    @GetMapping("/published")
    public List<ContentResponse> published() {
        return contentService.published();
    }

    @GetMapping("/{id}")
    public ContentResponse get(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id) {
        return contentService.get(userId, id);
    }

    @GetMapping("/{id}/versions")
    public List<VersionResponse> versions(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id) {
        return contentService.versions(userId, id);
    }

    @PostMapping("/draft")
    public ContentResponse createDraft(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody ContentRequest request) {
        return contentService.createDraft(userId, request);
    }

    @PutMapping("/{id}/draft")
    public ContentResponse updateDraft(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody ContentRequest request
    ) {
        return contentService.updateDraft(userId, id, request);
    }

    @PostMapping("/publish")
    public ContentResponse createAndPublish(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody ContentRequest request) {
        return contentService.createAndPublish(userId, request);
    }

    @PutMapping("/{id}/publish")
    public ContentResponse publish(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody ContentRequest request
    ) {
        return contentService.publish(userId, id, request);
    }
}
