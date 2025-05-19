package com.ojtech.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.ojtech.api.model")
@ComponentScan(basePackages = "com.ojtech.api")
@EnableJpaRepositories(basePackages = "com.ojtech.api.repository")
public class OjtechApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(OjtechApiApplication.class, args);
    }
} 