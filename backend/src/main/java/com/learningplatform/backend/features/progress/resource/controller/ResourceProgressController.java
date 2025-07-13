package com.learningplatform.backend.features.progress.resource.controller;

import com.learningplatform.backend.features.progress.resource.dto.response.ResourceProgressResponse;
import com.learningplatform.backend.features.progress.resource.service.ResourceProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress/resource")
public class ResourceProgressController {

    private final ResourceProgressService resourceProgressService;

    public ResourceProgressController(ResourceProgressService resourceProgressService) {
        this.resourceProgressService = resourceProgressService;
    }

    // Changed to a more specific endpoint for marking as complete,
    // as completionStatus will always be true.
    @PutMapping("/{resourceId}/complete")
    public ResponseEntity<ResourceProgressResponse> markResourceAsComplete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long resourceId) {
        
        // Directly call the service to set completionStatus to true
        ResourceProgressResponse response = resourceProgressService.updateResourceCompletionStatus(userId, resourceId, true);
        return ResponseEntity.ok(response);
    }
}