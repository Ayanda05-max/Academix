package com.academix.academix_backend.dto;
import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String message;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;

    public Long getId(){
        return id;
    }

    public String getMessage(){
        return message;
    }

    public String getType(){
        return type;
    }

    public boolean isRead(){
        return isRead;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setId(Long id){
        this.id = id;
    }

     public void setMessage(String message){
        this.message = message;
    }

     public void setType(String type){
        this.type = type;
    }

     public void setRead(boolean isRead){
        this.isRead = isRead;
    }

     public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt;
    }
}
