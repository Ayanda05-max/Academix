package com.academix.academix_backend.dto;
import java.time.LocalDateTime;


public class GradeResponse {
 
    private Long id;
    private Long submissionId;
    private Long studentId;
    private Long courseId;
    private Double marksAwarded;
    private String feedback;
    private LocalDateTime gradedAt;


    public Long getId(){
        return id;
    }

    public Long getSubmissionId(){
        return submissionId;
    }

    public Long getStudentId(){
        return studentId;
    }

    public Long getCourseId(){
        return courseId;
    }

    public Double getMarksAwarded(){
        return marksAwarded;
    }

    public String getFeedback(){
        return feedback;
    }

    public LocalDateTime getGradedAt(){
        return gradedAt;
    }

    public void setId(Long id){
        this.id = id;
    }

    public void setStudentId(Long studentId){
        this.studentId = studentId;
    }

    public void setCourseId(Long courseId){
        this.courseId = courseId;
    }

    public void setSubmissionId(Long submissionId){
        this.submissionId = submissionId;
    }

    public void setMarksAwarded(Double marksAwarded){
        this.marksAwarded = marksAwarded;
    }

    public void setFeedback(String feedback){
        this.feedback = feedback;
    }

    public void setGradedAt(LocalDateTime gradedAt){
        this.gradedAt = gradedAt;
    }
}

