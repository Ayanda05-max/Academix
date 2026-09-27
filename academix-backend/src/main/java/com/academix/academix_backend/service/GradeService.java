package com.academix.academix_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.academix_backend.repository.GradeRepository;
import com.academix.academix_backend.repository.SubmissionRepository;
import com.academix.academix_backend.repository.AssignmentRepository;

import com.academix.academix_backend.model.Grade;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.Assignment;

import com.academix.academix_backend.dto.GradeRequest;
import com.academix.academix_backend.dto.GradeResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;


@Service
public class GradeService {

    @Autowired 
    private GradeRepository gradeRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired 
    private AssignmentRepository assignmentRepository;

    @Autowired 
    private NotificationService notificationService;

    @Transactional 
    public GradeResponse recordGrade(GradeRequest request){
         Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found!"));

        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found!"));

        validateMarks(request.getMarksAwarded(), assignment.getTotalMarks());

        Grade grade = new Grade();
        grade.setSubmissionId(submission.getId());
        grade.setStudentId(submission.getStudentId());
        grade.setCourseId(assignment.getCourseId());
        grade.setMarksAwarded(request.getMarksAwarded());
        grade.setFeedback(request.getFeedback());
        grade.setGradedAt(LocalDateTime.now());

        Grade savedGrade = gradeRepository.save(grade);

        notificationService.notifyGradeReleased(grade.getStudentId(), grade.getCourseId());

        return mapToResponse(savedGrade);
    }

    @Transactional
    public GradeResponse updateGrade(Long id, GradeRequest request) {

        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade not found!"));

        if (request.getMarksAwarded() != null) {
            Assignment assignment = assignmentRepository.findById(
                    submissionRepository.findById(grade.getSubmissionId())
                            .orElseThrow(() -> new RuntimeException("Submission not found!"))
                            .getAssignmentId())
                    .orElseThrow(() -> new RuntimeException("Assignment not found!"));

            validateMarks(request.getMarksAwarded(), assignment.getTotalMarks());
            grade.setMarksAwarded(request.getMarksAwarded());
        }

        if (request.getFeedback() != null) {
            grade.setFeedback(request.getFeedback());
        }

        Grade updatedGrade = gradeRepository.save(grade);

        return mapToResponse(updatedGrade);
    }

    public Double getAverageForCourse(Long courseId) {
        List<Grade> grades = gradeRepository.findByCourseId(courseId);

        if (grades.isEmpty()) {
            return null;
        }
    

        double sum = 0;
        for (Grade grade : grades) {
            sum += grade.getMarksAwarded();
        }
        return sum / grades.size();
    }

    private void validateMarks(Integer marksAwarded, Number totalMarks) {
    if (marksAwarded == null || marksAwarded < 0) {
        throw new IllegalArgumentException("Marks awarded cannot be negative!");
    }
    if (totalMarks != null && marksAwarded > totalMarks.doubleValue()) {
        throw new IllegalArgumentException("Marks awarded cannot exceed total marks for this assignment!");
    }
     
    

}
    public List<GradeResponse> getGradesByStudent(Long studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        List<GradeResponse> responses = new ArrayList<>();
        for (Grade grade : grades) {
            responses.add(mapToResponse(grade));
        }
        return responses;
    }

    public List<GradeResponse> getGradesByCourse(Long courseId) {
        List<Grade> grades = gradeRepository.findByCourseId(courseId);
        List<GradeResponse> responses = new ArrayList<>();
        for (Grade grade : grades) {
            responses.add(mapToResponse(grade));
        }
        return responses;
    }
    private GradeResponse mapToResponse(Grade grade) {
        GradeResponse response = new GradeResponse();
        response.setId(grade.getId());
        response.setSubmissionId(grade.getSubmissionId());
        response.setStudentId(grade.getStudentId());
        response.setCourseId(grade.getCourseId());
        response.setMarksAwarded(grade.getMarksAwarded());
        response.setFeedback(grade.getFeedback());
        response.setGradedAt(grade.getGradedAt());
        return response;
    }


}
    
