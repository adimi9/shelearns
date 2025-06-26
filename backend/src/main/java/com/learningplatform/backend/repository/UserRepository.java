package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.User;

import org.springframework.stereotype.Repository;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional; 

@Repository
public interface UserRepository extends CrudRepository<User, Long> {

    Optional<User> findByEmail(String email); 
    boolean existsByEmail(String email); 

    Optional<User> findByName(String name); 
    boolean existsByName(String name); 
}