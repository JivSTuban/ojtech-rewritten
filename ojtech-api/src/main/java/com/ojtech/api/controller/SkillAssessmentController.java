package com.ojtech.api.controller;

import com.ojtech.api.model.SkillAssessment;
import com.ojtech.api.service.SkillAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/skills")

@Tag(name = "Skill Assessments", description = "Skill assessment management endpoints")
public class SkillAssessmentController {

    private final SkillAssessmentService skillAssessmentService;
    
    public SkillAssessmentController(SkillAssessmentService skillAssessmentService) {
        this.skillAssessmentService = skillAssessmentService;
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Get skills by user",
            description = "Retrieves all skill assessments for a specific user"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved skill assessments",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = SkillAssessment.class)))
    )
    public ResponseEntity<List<SkillAssessment>> getSkillsByUser(
            @Parameter(description = "User ID", required = true)
            @PathVariable UUID userId) {
        return ResponseEntity.ok(skillAssessmentService.getSkillsByUser(userId));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get skill assessment by ID",
            description = "Retrieves a specific skill assessment by its UUID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved skill assessment",
            content = @Content(schema = @Schema(implementation = SkillAssessment.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Skill assessment not found"
    )
    public ResponseEntity<SkillAssessment> getSkillById(
            @Parameter(description = "Skill assessment ID", required = true)
            @PathVariable UUID id) {
        return skillAssessmentService.getSkillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}/skill/{skillName}")
    @Operation(
            summary = "Get skill assessment by user and skill name",
            description = "Retrieves a specific skill assessment for a user by skill name"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved skill assessment",
            content = @Content(schema = @Schema(implementation = SkillAssessment.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Skill assessment not found"
    )
    public ResponseEntity<SkillAssessment> getSkillByUserAndName(
            @Parameter(description = "User ID", required = true)
            @PathVariable UUID userId,
            @Parameter(description = "Skill name", required = true)
            @PathVariable String skillName) {
        return skillAssessmentService.getSkillByUserAndName(userId, skillName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/names")
    @Operation(
            summary = "Get all skill names",
            description = "Retrieves a list of all unique skill names in the system"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved skill names",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = String.class)))
    )
    public ResponseEntity<List<String>> getAllSkillNames() {
        return ResponseEntity.ok(skillAssessmentService.getAllSkillNames());
    }

    @PostMapping
    @Operation(
            summary = "Create skill assessment",
            description = "Creates a new skill assessment for a user"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Skill assessment created successfully",
            content = @Content(schema = @Schema(implementation = SkillAssessment.class))
    )
    public ResponseEntity<SkillAssessment> createSkillAssessment(
            @Parameter(description = "Skill assessment to create", required = true)
            @Valid @RequestBody SkillAssessment skillAssessment) {
        SkillAssessment createdSkill = skillAssessmentService.createSkillAssessment(skillAssessment);
        return new ResponseEntity<>(createdSkill, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update skill assessment",
            description = "Updates an existing skill assessment"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Skill assessment updated successfully",
            content = @Content(schema = @Schema(implementation = SkillAssessment.class))
    )
    @ApiResponse(
            responseCode = "404",
            description = "Skill assessment not found"
    )
    public ResponseEntity<SkillAssessment> updateSkillAssessment(
            @Parameter(description = "Skill assessment ID", required = true)
            @PathVariable UUID id,
            @Parameter(description = "Updated skill assessment", required = true)
            @Valid @RequestBody SkillAssessment skillAssessment) {
        try {
            SkillAssessment updatedSkill = skillAssessmentService.updateSkillAssessment(id, skillAssessment);
            return ResponseEntity.ok(updatedSkill);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete skill assessment",
            description = "Deletes a skill assessment by ID"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Skill assessment deleted successfully"
    )
    @ApiResponse(
            responseCode = "404",
            description = "Skill assessment not found"
    )
    public ResponseEntity<Void> deleteSkillAssessment(
            @Parameter(description = "Skill assessment ID", required = true)
            @PathVariable UUID id) {
        try {
            skillAssessmentService.deleteSkillAssessment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 