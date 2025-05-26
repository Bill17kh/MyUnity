# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17 AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml file to download dependencies
COPY pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline

# Copy the source code
COPY src ./src

# Build the application JAR
RUN mvn package -DskipTests

# Stage 2: Create the final lightweight image
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/myunity-0.0.1-SNAPSHOT.jar app.jar

# Expose the port the application runs on
EXPOSE 8080

# Define environment variables for configuration (defaults can be set here or via docker run/compose)
# ENV SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/myunitydb
# ENV SPRING_DATASOURCE_USERNAME=user
# ENV SPRING_DATASOURCE_PASSWORD=password
# ENV APP_JWT_SECRET=YourDefaultSecretKeyHereIfNotSetViaEnv

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

