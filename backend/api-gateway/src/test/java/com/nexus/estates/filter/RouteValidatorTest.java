package com.nexus.estates.filter;

import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteValidatorTest {

    private final RouteValidator routeValidator = new RouteValidator();

    @Test
    void shouldReturnFalseForOpenEndpoints() {
        // Arrange
        var request = MockServerHttpRequest.get("/api/users/auth/login").build();

        // Act
        boolean result = routeValidator.isSecured.test(request);

        // Assert
        assertFalse(result, "Login endpoint should not be secured");
    }

    @Test
    void shouldReturnTrueForSecuredEndpoints() {
        // Arrange
        var request = MockServerHttpRequest.get("/api/v1/bookings").build();

        // Act
        boolean result = routeValidator.isSecured.test(request);

        // Assert
        assertTrue(result, "Bookings endpoint should be secured");
    }
}
