package hotelpms.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final String issuer;
    private final Duration accessTokenTtl;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.issuer:hotel-pms}") String issuer,
            @Value("${app.security.jwt.access-token-ttl-minutes:15}") int ttlMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.accessTokenTtl = Duration.ofMinutes(ttlMinutes);
    }

    public String generateToken(String subject) {
        Date now = new Date();
        return Jwts.builder()
                .subject(subject)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenTtl.toMillis()))
                .signWith(key)
                .compact();
    }

    /** Returns the subject (email) or throws JwtException if invalid/expired. */
    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
