package com.academix.academix_backend.security;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import com.academix.academix_backend.security.JwtUtil;

@Component
public class JwtFilter extends OncePerRequestFilter {

@Autowired 
private JwtUtil jwtUtil;
@Override 
protected void doFilterInternal( HttpServletRequest request, HttpServletResponse response,
    FilterChain filterChain) throws ServletException, IOException{
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer ")){
           String token = authHeader.substring(7);

           if(jwtUtil.isTokenValid(token)){
              String email = jwtUtil.extractEmail(token);

            String role = jwtUtil.extractRole(token);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email, null, Collections.singletonList(
              new org.springframework.security.core.authority.SimpleGrantedAuthority(role)
            ));
             SecurityContextHolder.getContext()
                  .setAuthentication(authentication);
              
           }
     }
      filterChain.doFilter(request, response);

    }
   
    
}
