package com.ojtech.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Test", description = "Test API endpoints")
public class TestController {

    @Operation(
        summary = "Test the API",
        description = "Returns a simple message to verify that the API is working",
        tags = {"Test"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successful operation",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = HashMap.class)
            )
        )
    })
    @GetMapping
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "API is working!");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
} 