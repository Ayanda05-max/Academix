package com.academix.academix_backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.academix.academix_backend.service.NotificationService;
import com.academix.academix_backend.dto.NotificationResponse;

import java.util.List;

@RestController 
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired 
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<NotificationResponse> getNotificationsForUser(@PathVariable Long userId){
        return notificationService.getNotificationsForUser(userId);
    }

    @PutMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id){
        return notificationService.markAsRead(id);
    }

}
