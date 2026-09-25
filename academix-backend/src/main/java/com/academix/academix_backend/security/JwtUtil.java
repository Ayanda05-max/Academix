package com.academix.academix_backend.security;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import java.security.Key;
import java.util.Date;


@Component
public class JwtUtil {
 @Value("${jwt.secret}")
 private String secretKey;

 private final long EXPIRATION_TIME = 86400000; //24HRS 

 private Key getSigningKey(){
    return Keys.hmacShaKeyFor(secretKey.getBytes());
 }

public String generateToken(String email, String role){
    return Jwts.builder()
         .setSubject(email)
         .claim("role", role)
         .setIssuedAt(new Date())
         .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
         .signWith(getSigningKey(), SignatureAlgorithm.HS256)
         .compact();
}

private Claims extractAllClaims(String token){
    return Jwts.parserBuilder()
           .setSigningKey(getSigningKey())
           .build()
           .parseClaimsJws(token)
           .getBody();
}

public String extractEmail(String token){
    return extractAllClaims(token).getSubject();
}

public String extractRole(String token){
    return extractAllClaims(token).get("role", String.class);
}
private boolean isTokenExpired(String token){
    return extractAllClaims(token).getExpiration().before(new Date());
}
public boolean isTokenValid(String token){
    return !isTokenExpired(token);
}

}
