package hotelpms.common.auth.service;

import hotelpms.common.auth.dto.LoginRequest;
import hotelpms.common.auth.dto.LoginResponse;
import hotelpms.common.auth.dto.MeResponse;
import hotelpms.common.exception.NotFoundException;
import hotelpms.common.security.JwtService;
import hotelpms.common.user.entity.User;
import hotelpms.common.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException cause) {
            throw new BadCredentialsException("Invalid credentials", cause);
        }

        User user = userRepository.findByEmailWithRoleAndPermissions(request.email())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.email()));

        String token = jwtService.generateToken(user.getEmail());
        String roleName = user.getRole() != null ? user.getRole().getName() : null;

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(), roleName);
    }

    @Transactional(readOnly = true)
    public MeResponse me(String email) {
        User user = userRepository.findByEmailWithRoleAndPermissions(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        List<String> permissions = user.getRole() == null ? List.of()
                : user.getRole().getPermissions().stream()
                        .map(p -> p.getCode())
                        .sorted()
                        .toList();

        return new MeResponse(user.getId(), user.getEmail(), user.getFullName(),
                              user.getUsername(), roleName, permissions);
    }
}
