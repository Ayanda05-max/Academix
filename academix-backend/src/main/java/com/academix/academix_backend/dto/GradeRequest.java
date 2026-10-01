package com.academix.academix_backend.dto;

public class GradeRequest {
  
    private Long submissionId;
    private Integer marksAwarded;
    private String feedback;

    public Long getSubmissionId(){
        return submissionId;
    }

    public Integer getMarksAwarded(){
        return marksAwarded;
    }

    public String getFeedback(){
        return feedback;
    }

    public void setSubmissionId(Long submissionId){
        this.submissionId = submissionId;
    }

    public void setMarksAwarded(Integer marksAwarded){
        this.marksAwarded = marksAwarded;
    }

    public void setFeedback(String feedback){
        this.feedback = feedback;
    }
}
