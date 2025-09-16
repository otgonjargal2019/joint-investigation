package com.lsware.joint_investigation.config.filter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.lsware.joint_investigation.config.CustomUser;
import com.lsware.joint_investigation.util.JwtHelper;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${security.jwt.header-string}")
    private String headerAuthentication;

    @Value("${security.jwt.token-prefix}")
    private String tokenPrefix;

    @Autowired
    private JwtHelper jwtHelper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        boolean doFilter = true;
        List<String> urlExceptions = Arrays.asList(
                "/api/auth/",
                "/api/app/",
                "/api/user/avatar",
                "/web/",
                "/files/download/",
                "/api/admin/statistic/register/contactus",
                "/api/organizational-data");

        for (String urlException : urlExceptions) {
            if (request.getRequestURI().startsWith(urlException)) {
                doFilter = false;
                break;
            }
        }

        if (doFilter) {
            String jwtToken = getJWTFromRequest(request);
            if (jwtToken == null) {
                sendUnauthorized(response);
                return;
            }

            try {

                String username = jwtHelper.extractSubject(jwtToken);
                if (username != null) {
                    @SuppressWarnings("unchecked")
                    Function<Claims, String> roleResolver = claims -> (String) claims.get("role", String.class);

                    String rolePayload = jwtHelper.extractClaim(jwtToken, roleResolver);

                    // Create authorities collection with the ROLE_ prefix that Spring Security
                    // expects
                    Collection<GrantedAuthority> authorities = new ArrayList<>();
                    if (rolePayload != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + rolePayload));
                    }

                    UsernamePasswordAuthenticationToken authenticationToken;
                    CustomUser userDetails = new CustomUser(UUID.fromString(username), "", authorities);
                    authenticationToken = new UsernamePasswordAuthenticationToken(userDetails,
                            userDetails.getPassword(),
                            userDetails.getAuthorities());

                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                } else {
                    sendUnauthorized(response);
                    return;
                }
            } catch (Exception e) {
                System.out.println("JWT Authentication failed: " + e.getMessage());
                e.printStackTrace();
                sendUnauthorized(response);
                return;
            }

        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":401,\"message\":\"Unauthorized\"}");
        response.getWriter().flush();
        response.getWriter().close();
    }

    private String getJWTFromRequest(HttpServletRequest request) {
        // String bearerToken = request.getHeader(headerAuthentication);
        // if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(tokenPrefix +
        // " ")) {
        // return bearerToken.substring(7, bearerToken.length());
        // }
        // return null;

        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

}
