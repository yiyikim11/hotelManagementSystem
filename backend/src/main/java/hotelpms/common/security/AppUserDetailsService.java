package hotelpms.common.security;

import hotelpms.common.user.entity.User;
import hotelpms.common.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // JOIN FETCH role + permissions to avoid N+1 on the lazy collections
        User user = userRepository.findByEmailWithRoleAndPermissions(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        var authorities = new ArrayList<SimpleGrantedAuthority>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()));
            user.getRole().getPermissions().forEach(p ->
                    authorities.add(new SimpleGrantedAuthority(p.getCode())));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.isActive(),
                true, true, true,
                List.copyOf(authorities)
        );
    }
}
