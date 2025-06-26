package com.learningplatform.backend.security.services;

import com.learningplatform.backend.model.User; // Your JPA User entity
import com.learningplatform.backend.repository.UserRepository; // Your Spring Data JPA User repository

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Good practice for database interactions

@Service // Mark this class as a Spring Service component
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository; // Inject your UserRepository to fetch User data

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional // Ensures that the database lookup is part of a transaction
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Spring Security will call this method with the "username" provided during login.
        // In your application, the user's email is likely used as the username.

        User user = userRepository.findByEmail(email) // Use your repository to find the user by email
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Once the User entity is found, convert it into a UserDetails object
        // using the static build method we defined in UserDetailsImpl.
        return UserDetailsImpl.build(user);
    }
}