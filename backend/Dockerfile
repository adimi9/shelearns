# Stage 1: Build the application (or simply copy the pre-built JAR)
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

# --- REMOVE THESE LINES ---
# COPY .env /app/.env
# --- END REMOVAL ---

# Stage 2: Create the final runtime image
FROM eclipse-temurin:21-jre AS final

WORKDIR /app

# Copy the JAR from the 'build' stage
COPY --from=build /app/app.jar /app/app.jar
# --- REMOVE THIS LINE ---
# COPY --from=build /app/.env /app/.env
# --- END REMOVAL ---

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# Optional: Environment variables
# These should now be set directly in Render dashboard, not in .env in Dockerfile
# ENV SPRING_PROFILES_ACTIVE=production
# ENV JAVA_OPTS="-Xmx512m -Xms256m"