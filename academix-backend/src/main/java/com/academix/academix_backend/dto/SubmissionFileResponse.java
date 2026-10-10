package com.academix.academix_backend.dto;

public class SubmissionFileResponse {

    private final Long id;
    private final String name;
    private final String contentType;
    private final long size;

    public SubmissionFileResponse(Long id, String name, String contentType, long size) {
        this.id = id;
        this.name = name;
        this.contentType = contentType;
        this.size = size;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getContentType() { return contentType; }
    public long getSize() { return size; }
}
