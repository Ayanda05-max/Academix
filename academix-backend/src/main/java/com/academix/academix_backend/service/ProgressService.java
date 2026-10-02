package com.academix.backend.service;

import com.academix.backend.model.Lesson;
import com.academix.backend.model.Progress;
import com.academix.backend.repository.LessonRepository;
import com.academix.backend.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class ProgressService {
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;

    @Autowired
    public ProgressService(ProgressRepository progressRepository, LessonRepository lessonRepository) {
        this.progressRepository = progressRepository;
        this.lessonRepository = lessonRepository;
    }
    public Progress markLessonComplete(Long studentId, Long courseId,Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Lesson does not belong to the specified course");
        }
        Progress progress = progressRepository
                .findByStudentIdAndCourseIdAndLessonId(studentId, courseId, lessonId)
                .orElse(Progress.builder().studentId(studentId).courseId(courseId).lessonId(lessonId).build());
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());

        return progress;

    }
    public double getCourseCompletionRercentage(Long studentId, Long courseId) {
        List<Progress> progressList = progressRepository.findByStudentIdAndCourseId(studentId, courseId);
        if(progressList.isEmpty()) {
            return 0.0;
        }
        long completedCount = progressList.stream().filter(Progress::getCompleted).count();

        return (completedCount * 100.0 / progressList.size());
    }
    public List<Progress> getStudentProgress(Long studentId, Long courseId) {
        return progressRepository.findByStudentIdAndCourseId(studentId, courseId);
    }
}
