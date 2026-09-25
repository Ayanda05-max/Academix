package com.academix.academix_backend.dto;

public class GradeRequest {
  
    private Long submissionId;
    private Double marksAwarded;
    private String feedback;

    public Long getSubmissionId(){
        return submissionId;
    }

    public Double getMarksAwarded(){
        return marksAwarded;
    }

    public String getFeedback(){
        return feedback;
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
}
