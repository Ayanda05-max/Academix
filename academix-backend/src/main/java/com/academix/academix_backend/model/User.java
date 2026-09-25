package com.academix.academix_backend.model;

import jakarta.persistence.* ;
import java.time.LocalDateTime;

@Entity // For the database table.
@Table(name = "users")

public class User {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Automatically generates an ID from 1 onwards.
    private Long id;

   @Column(nullable = false) 
   private String firstName;

   @Column(nullable = false)
   private String lastName;

   @Column(nullable = false, unique = true)
   private String email;

   @Column(nullable = false)
   private String password;

   @Column(nullable = false)
   private String role;

   private LocalDateTime createdAt;
   
   @PrePersist
   protected void onCreate(){
    this.createdAt = LocalDateTime.now(); //Date and time each user was added.

   }
   public User(){
       }

    public Long getId(){
        return id;
    }
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

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setId(Long id){
        this.id = id;
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
        if(password.length() < 5){
            System.out.println("Your password has to be 5 characters and more.");
          return;
        }
        this.password = password;

    }
    public void setRole(String role){
        if(role.equalsIgnoreCase("Student"  ) || role.equalsIgnoreCase("Lecturer" ) || role.equalsIgnoreCase("Admin" )){
        this.role = role;
    }
    else{
        System.out.println("Role must either be Student, Lecturer or Admin.");
    }
}
}