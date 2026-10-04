package com.academix.academix_backend.dto;

import java.util.List;

public class QuizSubmitRequest {

    
    private List<Integer> answers;

    public List<Integer> getAnswers() { return answers; }
    public void setAnswers(List<Integer> answers) { this.answers = answers; }
}
