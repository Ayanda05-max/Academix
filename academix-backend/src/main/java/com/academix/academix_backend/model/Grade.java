package com.academix.academix_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity 
@Table(name = "grades")

public class Grade {
@Id 
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false)
private Long submissionId;

@Column(nullable = false)
private Long studentId;

@Column(nullable = false)
private Long courseId;

@Column(nullable = false)
private Integer marksAwarded;

@Column
private String feedback;

@Column(nullable = false)
private LocalDateTime gradedAt;


@PrePersist 
protected void onCreate(){
    this.gradedAt =LocalDateTime.now();
}

public Grade(){

}

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

public Integer getMarksAwarded(){
    return marksAwarded;
}

public String getFeedback(){
    return feedback;
}

public LocalDateTime getGradedAt(){
    return gradedAt;
}

public void setSubmissionId(Long submissionId){
    this.submissionId = submissionId;
}

public void setId(Long id){
    this.id = id;
}

public void setStudentId(Long studentId){
    this.studentId= studentId;
}

public void setCourseId(Long courseId){
    this.courseId = courseId;
}

public void setMarksAwarded(Integer marksAwarded){
    this.marksAwarded = marksAwarded;
}

public void setFeedback(String feedback){
    this.feedback = feedback;
}

public void setGradedAt(LocalDateTime gradedAt){
    this.gradedAt= gradedAt;
}

}
