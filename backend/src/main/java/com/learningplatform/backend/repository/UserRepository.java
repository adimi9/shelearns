// perform database operations on the User Entity (users table)
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // used for methods that might not return a result

// Extends JpaRepository:
// It automatically provides common CRUD (Create, Read, Update, Delete) methods
// for the `User` entity, using `Long` as the type for its primary key (ID).
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query method: Spring automatically generates the code to find a User by email.
    Optional<User> findByEmail(String email); // return Optional<User> to handle cases where email isn't found.

    // Custom query method: Spring automatically generates the code to check if an email exists.
    boolean existsByEmail(String email); // Returns true if an email exists, false otherwise.
}