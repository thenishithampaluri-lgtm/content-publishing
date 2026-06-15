package com.content.publishing.service;

import com.content.publishing.dto.ContentDtos.ContentRequest;
import com.content.publishing.dto.ContentDtos.ContentResponse;
import com.content.publishing.dto.ContentDtos.VersionResponse;
import com.content.publishing.entity.AppUser;
import com.content.publishing.entity.Content;
import com.content.publishing.entity.ContentStatus;
import com.content.publishing.entity.ContentVersion;
import com.content.publishing.entity.Draft;
import com.content.publishing.entity.EditLog;
import com.content.publishing.repository.ContentRepository;
import com.content.publishing.repository.ContentVersionRepository;
import com.content.publishing.repository.DraftRepository;
import com.content.publishing.repository.EditLogRepository;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContentService {
    private final ContentRepository contentRepository;
    private final DraftRepository draftRepository;
    private final ContentVersionRepository versionRepository;
    private final EditLogRepository editLogRepository;
    private final UserService userService;

    public ContentService(
            ContentRepository contentRepository,
            DraftRepository draftRepository,
            ContentVersionRepository versionRepository,
            EditLogRepository editLogRepository,
            UserService userService
    ) {
        this.contentRepository = contentRepository;
        this.draftRepository = draftRepository;
        this.versionRepository = versionRepository;
        this.editLogRepository = editLogRepository;
        this.userService = userService;
    }

    public List<ContentResponse> search(Long userId, String query, String status) {
        ContentStatus parsedStatus = parseStatus(status);
        return contentRepository.searchOwnedContent(userId, normalizeQuery(query), parsedStatus)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ContentResponse> published() {
        return contentRepository.findByStatusOrderByPublishedAtDesc(ContentStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ContentResponse get(Long userId, Long contentId) {
        return toResponse(requireOwned(contentId, userId));
    }

    @Transactional
    public ContentResponse createDraft(Long userId, ContentRequest request) {
        AppUser user = userService.requireUser(userId);
        Content content = new Content();
        content.setAuthor(user);
        applyRequest(content, request);
        content.setStatus(ContentStatus.DRAFT);
        content = contentRepository.save(content);
        saveDraftMarker(content);
        log(content, user, "DRAFT_CREATED");
        return toResponse(content);
    }

    @Transactional
    public ContentResponse updateDraft(Long userId, Long contentId, ContentRequest request) {
        AppUser user = userService.requireUser(userId);
        Content content = requireOwned(contentId, userId);
        applyRequest(content, request);
        content.setStatus(ContentStatus.DRAFT);
        content.setUpdatedAt(Instant.now());
        content = contentRepository.save(content);
        saveDraftMarker(content);
        log(content, user, "DRAFT_SAVED");
        return toResponse(content);
    }

    @Transactional
    public ContentResponse createAndPublish(Long userId, ContentRequest request) {
        ContentResponse draft = createDraft(userId, request);
        return publish(userId, draft.id(), request);
    }

    @Transactional
    public ContentResponse publish(Long userId, Long contentId, ContentRequest request) {
        AppUser user = userService.requireUser(userId);
        Content content = requireOwned(contentId, userId);
        applyRequest(content, request);
        content.setStatus(ContentStatus.PUBLISHED);
        content.setVersionNumber(content.getVersionNumber() + 1);
        content.setPublishedAt(Instant.now());
        content.setUpdatedAt(Instant.now());
        content = contentRepository.save(content);
        saveVersion(content);
        log(content, user, "PUBLISHED_VERSION_" + content.getVersionNumber());
        return toResponse(content);
    }

    public List<VersionResponse> versions(Long userId, Long contentId) {
        requireOwned(contentId, userId);
        return versionRepository.findByContentIdOrderByVersionNumberDesc(contentId)
                .stream()
                .map(version -> new VersionResponse(
                        version.getId(),
                        version.getVersionNumber(),
                        version.getTitle(),
                        version.getSummary(),
                        version.getCreatedAt()
                ))
                .toList();
    }

    private Content requireOwned(Long contentId, Long userId) {
        return contentRepository.findByIdAndAuthorId(contentId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Content not found"));
    }

    private void applyRequest(Content content, ContentRequest request) {
        content.setTitle(request.title().trim());
        content.setSummary(request.summary() == null ? "" : request.summary().trim());
        content.setBody(request.body() == null ? "" : request.body());
        content.setTopics(cleanTopics(request.topics()));
    }

    private List<String> cleanTopics(List<String> topics) {
        if (topics == null) {
            return List.of();
        }
        return topics.stream()
                .map(String::trim)
                .filter(topic -> !topic.isBlank())
                .distinct()
                .toList();
    }

    private void saveDraftMarker(Content content) {
        Draft draft = draftRepository.findByContentId(content.getId()).orElseGet(Draft::new);
        draft.setContent(content);
        draft.setSavedAt(Instant.now());
        draftRepository.save(draft);
    }

    private void saveVersion(Content content) {
        ContentVersion version = new ContentVersion();
        version.setContent(content);
        version.setVersionNumber(content.getVersionNumber());
        version.setTitle(content.getTitle());
        version.setSummary(content.getSummary());
        version.setBody(content.getBody());
        versionRepository.save(version);
    }

    private void log(Content content, AppUser user, String action) {
        EditLog log = new EditLog();
        log.setContent(content);
        log.setUser(user);
        log.setAction(action);
        editLogRepository.save(log);
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return "";
        }
        return query.toLowerCase()
                .replace("articles on", "")
                .replace("drafts related to", "")
                .replace("topics", "")
                .trim();
    }

    private ContentStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        try {
            return ContentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid content status");
        }
    }

    private ContentResponse toResponse(Content content) {
        return new ContentResponse(
                content.getId(),
                content.getTitle(),
                content.getSummary(),
                content.getBody(),
                content.getTopics(),
                content.getStatus(),
                content.getVersionNumber(),
                content.getCreatedAt(),
                content.getUpdatedAt(),
                content.getPublishedAt()
        );
    }
}
