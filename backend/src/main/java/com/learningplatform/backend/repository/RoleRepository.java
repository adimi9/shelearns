package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.enums.ERole; 

import org.springframework.stereotype.Repository;
import org.springframework.data.repository.CrudRepository; 

import java.util.Optional; 

@Repository
public interface RoleRepository extends CrudRepository<Role, Integer> {

    Optional<Role> findByName(ERole name);

}