package com.learningplatform.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.learningplatform.backend.config.DataInitializer;

@SpringBootTest
@ActiveProfiles("test") // <-- Add this line
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
