package com.lsware.joint_investigation.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

import io.jsonwebtoken.io.Decoders;

import java.util.*;
import java.util.function.Function;

@Component
public class JwtHelper {

	@Value("${security.jwt.secret-key}")
	private String secretKey;

	@Value("${security.jwt.expiration-time}")
	private long jwtExpiration;

	@Value("${security.jwt.expiration-time-long}")
	private long jwtExpirationLong;

	private Key getSignInKey() {
		byte[] keyBytes = Decoders.BASE64.decode(secretKey);
		return Keys.hmacShaKeyFor(keyBytes);
	}

	public String generateToken(UUID username) {
		return generateToken(new HashMap<>(), username, false);
	}

	public String generateToken(Map<String, Object> extraClaims, UUID username, boolean isRemember) {
		return buildToken(extraClaims, username, isRemember == true ? jwtExpirationLong : jwtExpiration);
	}

	private String buildToken(
			Map<String, Object> extraClaims,
			UUID username,
			long expiration) {
		return Jwts
				.builder()
				.setClaims(extraClaims)
				.setSubject(username.toString())
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(getSignInKey(), SignatureAlgorithm.HS256)
				.compact();
	}

	private Claims extractAllClaims(String token) {
		return Jwts
				.parserBuilder()
				.setSigningKey(getSignInKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	public String extractSubject(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

}
