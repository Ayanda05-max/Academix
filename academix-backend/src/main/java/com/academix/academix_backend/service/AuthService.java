package com.academix.academix_backend.service;

import org.springframework.stereotype.Service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.UserRepository;


@Service
public class AuthService {
 @Autowired
 private UserRepository userRepository;

 @Autowired
 private PasswordEncoder passwordEncoder;
 
 @Transactional
 //Registration for a new user to the system
 public User register(String firstName, String lastName, String email, String password, String role){
 
  if(userRepository.existsByEmail(email)){
  throw new IllegalArgumentException("Email already exists!");
 }
  
 User newUser = new User();

 newUser.setFirstName(firstName);
 newUser.setLastName(lastName);
 newUser.setEmail(email);

 String encryptedPassword = passwordEncoder.encode(password);

 newUser.setPassword((encryptedPassword));
 newUser.setRole(role);

 return userRepository.save(newUser);
}

public String login(String email, String password){
  User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found!"));

 if(!passwordEncoder.matches(password, user.getPassword())){
    throw new RuntimeException("Invalid password!");
 }

  return "Login Successful.";
}
}
