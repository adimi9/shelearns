package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.enums.ERole;

import org.springframework.stereotype.Repository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional; 

@Repository
public interface UserRepository extends CrudRepository<User, Long> {

    Optional<User> findByEmail(String email); 
    boolean existsByEmail(String email); 

    Optional<User> findByName(String name); 
    boolean existsByName(String name); 
    
    List<User> findByRole_Name(ERole name); 
    boolean existsByRole_Name(ERole name); 
}