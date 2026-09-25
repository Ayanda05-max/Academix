package com.academix.academix_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.UserRepository;
import java.util.List;


@Service
public class UserService {
  
   @Autowired
   private UserRepository userRepository;
   
   
    public User getUserById(Long id){
      User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return user;
   }
   public List<User> getAllUsers(){
    return userRepository.findAll(); 
   }
   
   public User updateUser(Long id, String firstName, String lastName, String email){
     User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
     user.setFirstName(firstName);
     user.setLastName(lastName);
     user.setEmail(email);

     return userRepository.save(user);
   }

   public void deleteUser(Long id){
      if(!userRepository.existsById(id)){
         throw new RuntimeException("User not found");
      }
      userRepository.deleteById(id);
   }
}



