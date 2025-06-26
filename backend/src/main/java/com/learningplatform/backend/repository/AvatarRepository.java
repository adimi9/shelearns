package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.Avatar;
import com.learningplatform.backend.model.enums.EAvatar; 

import org.springframework.stereotype.Repository;
import org.springframework.data.repository.CrudRepository; 

import java.util.Optional; 

@Repository
public interface AvatarRepository extends CrudRepository<Avatar, Integer> {

    Optional<Avatar> findByName(EAvatar name);

}