// File: src/main/java/com/learningplatform/backend/converter/StringListConverter.java
package com.learningplatform.backend.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Converter(autoApply = false) // We'll apply it manually
public class StringListConverter implements AttributeConverter<List<String>, String> {

    private final ObjectMapper objectMapper;

    // Spring will inject ObjectMapper if it's a bean
    public StringListConverter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null; // Store null or "[]" for empty lists
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting List<String> to JSON string", e);
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return new ArrayList<>(); // Return empty list for null or empty string
        }
        try {
            return objectMapper.readValue(dbData, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (IOException e) {
            throw new IllegalArgumentException("Error converting JSON string to List<String>", e);
        }
    }
}