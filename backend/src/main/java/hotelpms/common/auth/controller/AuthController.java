package hotelpms.common.auth.controller;

import hotelpms.common.auth.dto.LoginRequest;
import hotelpms.common.auth.dto.LoginResponse;
import hotelpms.common.auth.dto.MeResponse;
import hotelpms.common.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            throw new InsufficientAuthenticationException("Authentication required");
        }
        return ResponseEntity.ok(authService.me(principal.getUsername()));
    }
}
