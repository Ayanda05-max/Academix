package com.academix.academix_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    
    private JwtFilter jwtFilter;
    public SecurityConfig(JwtFilter jwtFilter){
        this.jwtFilter = jwtFilter;
    }
    
    @Bean 
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .httpBasic(basic -> basic.disable())
        .formLogin(form -> form.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/login").permitAll()
            .requestMatchers("/api/auth/register").hasAuthority("ADMIN")
            .anyRequest().authenticated()
        )
        .exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
           res.setStatus(401);
           res.setContentType("application/json");
           res.getWriter().write("{\"error\":\"Unauthorized\"}");
}));

    
    http.addFilterBefore(jwtFilter,
        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
}
