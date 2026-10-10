package com.academix.academix_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
@SpringBootApplication
public class AcademixBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AcademixBackendApplication.class, args);
	}

}