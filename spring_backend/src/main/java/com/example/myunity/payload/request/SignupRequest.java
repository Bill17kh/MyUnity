package com.example.myunity.payload.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String username;

    @NotBlank
    @Size(max = 255)
    @Email
    private String email;

    private Set<String> role; // Optional: Client can suggest roles, backend validates/assigns default

    @NotBlank
    @Size(min = 6, max = 120) // Adjust password constraints as needed
    private String password;
}

