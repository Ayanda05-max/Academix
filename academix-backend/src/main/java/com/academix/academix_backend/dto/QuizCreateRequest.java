package com.academix.academix_backend.dto;

import java.util.List;

public class QuizCreateRequest {

    private Long courseId;
    private String title;
    private Integer timeLimit;
    private List<Question> questions;

    public static class Question {
        private String text;
        private List<String> options;
        private Integer correctIndex;
        private Integer marks;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }

        public Integer getCorrectIndex() { return correctIndex; }
        public void setCorrectIndex(Integer correctIndex) { this.correctIndex = correctIndex; }

        public Integer getMarks() { return marks; }
        public void setMarks(Integer marks) { this.marks = marks; }
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}
