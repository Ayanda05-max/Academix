package com.academix.academix_backend.dto;

public class AuthResposne {
  
    private String token;
    private String email;
    private String role;

    public String getToken(){
        return token;
    }

    public String getEmail(){
        return email;
    }

    public String getRole(){
        return role;
    }

    public void setToken(String token){
        this.token = token;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public void setRole(String role){
        this.role = role;
    }
}
