# Stage 1: Build the application from source
FROM eclipse-temurin:21-jdk AS build

# Set the working directory inside the container for this stage.
WORKDIR /app

# Copy the Maven build files (pom.xml) first to leverage Docker's build cache
COPY pom.xml .

# Copy your source code
COPY src ./src

# Run the Maven build command to compile and package your application
# -Dmaven.test.skip=true is added to skip tests during the Docker build for faster builds.
# You might want to run tests in a separate CI step if necessary.
RUN mvn clean package -Dmaven.test.skip=true

# Stage 2: Create the final runtime image
FROM eclipse-temurin:21-jre AS final

# Set the working directory for the final image.
WORKDIR /app

# Copy the generated JAR from the 'build' stage into the final image.
# The JAR is now guaranteed to exist because we built it in the previous stage.
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# Optional: Environment variables (configured in Render dashboard, not in .env)
# ENV SPRING_PROFILES_ACTIVE=production
# ENV JAVA_OPTS="-Xmx512m -Xms256m"