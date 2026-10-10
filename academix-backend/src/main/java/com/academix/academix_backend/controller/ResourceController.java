package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.ResourceResponse;
import com.academix.academix_backend.service.CourseResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ResourceController {

    private final CourseResourceService resourceService;

    @Autowired
    public ResourceController(CourseResourceService resourceService) {
        this.resourceService = resourceService;
    }

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority();
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping(value = "/courses/{courseId}/resources", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResourceResponse upload(@PathVariable Long courseId,
                                   @RequestParam("title") String title,
                                   @RequestParam(value = "description", required = false) String description,
                                   @RequestParam("file") MultipartFile file,
                                   Authentication auth) {
        return resourceService.upload(courseId, title, description, file,
                auth.getName(), "ADMIN".equals(role(auth)));
    }

    @GetMapping("/courses/{courseId}/resources")
    public List<ResourceResponse> list(@PathVariable Long courseId, Authentication auth) {
        return resourceService.list(courseId, auth.getName(), role(auth));
    }

    @GetMapping("/resources/{resourceId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long resourceId, Authentication auth) {
        CourseResourceService.DownloadedFile file =
                resourceService.download(resourceId, auth.getName(), role(auth));

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.resource());
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @DeleteMapping("/resources/{resourceId}")
    public void delete(@PathVariable Long resourceId, Authentication auth) {
        resourceService.delete(resourceId, auth.getName(), "ADMIN".equals(role(auth)));
    }
}