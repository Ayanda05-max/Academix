package com.academix.academix_backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize; 
import com.academix.academix_backend.service.AuthService;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.dto.RegisterRequest;
import com.academix.academix_backend.dto.LoginRequest;


 @RestController
 @RequestMapping("/api/auth")
public class AuthController {
      
    @Autowired
    private AuthService authService;
    
   @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/register")
        public User register(@RequestBody RegisterRequest request){
        return authService.register(
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPassword(),
            request.getRole()
        ); 
        
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request){
        return authService.login(
            request.getEmail(),
            request.getPassword()
        );
    }
    
}
