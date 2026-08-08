package com.academix.academix_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.academix.academix_backend.model.User; 
import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
 
    public Optional<User> findByEmail(String email); //finds a user when they log in using their email.
    public boolean existsByEmail(String email); //Checks if an email is registered before creating an email.

    public List<User> findByRole(String role); //Finds all students, lecturers and admins


}
