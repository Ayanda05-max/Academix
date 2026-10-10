package com.academix.academix_backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
public class RegisterRequest {
   @JsonProperty("firstName")
   private String firstName;
   
   @JsonProperty("lastName")
   private String lastName;

   @JsonProperty("email")
   private String email;

   @JsonProperty("password")
   private String password;

   @JsonProperty("role")
   private String role; 
   
   

   public String getFirstName(){
    return firstName;
   }

    public String getLastName(){
    return lastName;
   }

 public String getEmail(){
    return email;
   }


 public String getPassword(){
    return password;
   }


 public String getRole(){
    return role;
   }

 public void setFirstName(String firstName){
        this.firstName = firstName;
    }
    public void setLastName(String lastName){
        this.lastName = lastName;
    }
    public void setEmail(String email){
        this.email = email;
    }

    public void setPassword(String password){
        this.password = password;

    }
    public void setRole(String role){
       this.role = role;
    
}
}
