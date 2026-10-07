package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.ResourceResponse;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseResource;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.CourseResourceRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseResourceService {

    private final CourseResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService storage;

    @Autowired
    public CourseResourceService(CourseResourceRepository resourceRepository,
                                 CourseRepository courseRepository,
                                 UserRepository userRepository,
                                 EnrollmentRepository enrollmentRepository,
                                 FileStorageService storage) {
        this.resourceRepository = resourceRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.storage = storage;
    }

    public record DownloadedFile(Resource resource, String fileName, String contentType) {}

    public ResourceResponse upload(Long courseId, String title, String description,
                                   MultipartFile file, String email, boolean isAdmin) {
        Course course = findCourse(courseId);
        User user = findUser(email);
        checkCanModify(course, user, isAdmin);

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }

        FileStorageService.StoredFile stored = storage.store(file, folderFor(courseId));

        CourseResource resource = new CourseResource();
        resource.setCourseId(courseId);
        resource.setTitle(title.trim());
        resource.setDescription(description == null || description.isBlank() ? null : description.trim());
        resource.setFileName(stored.originalName());
        resource.setStoredName(stored.storedName());
        resource.setContentType(stored.contentType());
        resource.setSizeBytes(stored.size());
        resource.setUploadedBy(user.getId());
        resource.setUploadedAt(LocalDateTime.now());
        return toResponse(resourceRepository.save(resource));
    }

    public List<ResourceResponse> list(Long courseId, String email, String role) {
        Course course = findCourse(courseId);
        User user = findUser(email);
        checkCanRead(course, user, role);
        return resourceRepository.findByCourseIdOrderByUploadedAtDesc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public DownloadedFile download(Long resourceId, String email, String role) {
        CourseResource resource = findResource(resourceId);
        Course course = findCourse(resource.getCourseId());
        User user = findUser(email);
        checkCanRead(course, user, role);
        Resource file = storage.load(folderFor(resource.getCourseId()), resource.getStoredName());
        return new DownloadedFile(file, resource.getFileName(), resource.getContentType());
    }

    public void delete(Long resourceId, String email, boolean isAdmin) {
        CourseResource resource = findResource(resourceId);
        Course course = findCourse(resource.getCourseId());
        User user = findUser(email);
        checkCanModify(course, user, isAdmin);
        resourceRepository.delete(resource);
        storage.delete(folderFor(resource.getCourseId()), resource.getStoredName());
    }

    private String folderFor(Long courseId) {
        return "resources/" + courseId;
    }

    private void checkCanModify(Course course, User user, boolean isAdmin) {
        if (isAdmin) {
            return;
        }
        if (!user.getId().equals(course.getInstructorId())) {
            throw new AccessDeniedException("You can only manage resources of your own courses");
        }
    }

    private void checkCanRead(Course course, User user, String role) {
        if ("ADMIN".equals(role)) {
            return;
        }
        if ("LECTURER".equals(role)) {
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view resources of your own courses");
            }
            return;
        }
        boolean enrolled = course.getStatus() == CourseStatus.PUBLISHED
                && enrollmentRepository.findByStudentIdAndCourseId(user.getId(), course.getId())
                        .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                        .isPresent();
        if (!enrolled) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }
    }

    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + id));
    }

    private CourseResource findResource(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Resource not found with id: " + id));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private ResourceResponse toResponse(CourseResource r) {
        return new ResourceResponse(r.getId(), r.getCourseId(), r.getTitle(), r.getDescription(),
                r.getFileName(), r.getContentType(), r.getSizeBytes(), r.getUploadedAt());
    }
}