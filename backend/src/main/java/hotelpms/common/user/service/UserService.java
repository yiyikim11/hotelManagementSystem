package hotelpms.common.user.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.common.role.repository.RoleRepository;
import hotelpms.common.user.dto.CreateUserRequest;
import hotelpms.common.user.dto.UserResponse;
import hotelpms.common.user.entity.User;
import hotelpms.common.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return UserResponse.from(getOrThrow(id));
    }

    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already in use: " + request.username());
        }

        var user = new User();
        user.setUsername(request.username());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setDepartment(request.department());

        if (request.roleId() != null) {
            user.setRole(roleRepository.findById(request.roleId())
                    .orElseThrow(() -> NotFoundException.of("Role", request.roleId())));
        }

        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse setActive(UUID id, boolean active) {
        User user = getOrThrow(id);
        user.setActive(active);
        return UserResponse.from(userRepository.save(user));
    }

    private User getOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("User", id));
    }
}
