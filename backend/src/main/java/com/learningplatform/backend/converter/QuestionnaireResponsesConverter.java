// File: src/main/java/com/learningplatform/backend/converter/QuestionnaireResponsesConverter.java
package com.learningplatform.backend.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Converter(autoApply = false) // We will apply it manually using @Convert
public class QuestionnaireResponsesConverter implements AttributeConverter<Map<String, List<String>>, String> {

    private final ObjectMapper objectMapper;

    // Spring will inject ObjectMapper if it's a bean, otherwise you can new it up
    public QuestionnaireResponsesConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String convertToDatabaseColumn(Map<String, List<String>> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            // Handle the exception appropriately, e.g., log it or throw a custom runtime exception
            throw new IllegalArgumentException("Error converting Map to JSON string", e);
        }
    }

    @Override
    public Map<String, List<String>> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            // Use TypeReference for complex types like Map<String, List<String>>
            return objectMapper.readValue(dbData, new com.fasterxml.jackson.core.type.TypeReference<Map<String, List<String>>>() {});
        } catch (IOException e) {
            // Handle the exception appropriately
            throw new IllegalArgumentException("Error converting JSON string to Map", e);
        }
    }
}