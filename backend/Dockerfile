# Stage 1: Build the application (or simply copy the pre-built JAR)
# Using a JDK 21 image for compilation/copying
FROM eclipse-temurin:21-jdk AS build

# Set the working directory inside the container.
WORKDIR /app

# Copy your pre-built Spring Boot JAR file into the container.
COPY target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

# Copy the .env file into the working directory of the container in the build stage.
# Ensure your .env file is in the same directory as your Dockerfile.
COPY .env /app/.env

# Stage 2: Create the final runtime image
# Using a JRE 21 image for a smaller and compatible final image
FROM eclipse-temurin:21-jre AS final

# Set the working directory for the final image.
WORKDIR /app

# Copy the JAR and the .env file from the 'build' stage to the final stage.
# The original JAR copy:
COPY --from=build /app/app.jar /app/app.jar
# This is the line that caused the error:
COPY --from=build /app/.env /app/.env 

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# Optional: Environment variables
# If your .env file handles all variables, you might not need these here.
# ENV SPRING_PROFILES_ACTIVE=production
# ENV JAVA_OPTS="-Xmx512m -Xms256m"