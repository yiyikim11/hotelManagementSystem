package hotelpms.common.auth.controller;

import hotelpms.common.auth.dto.MeResponse;
import hotelpms.common.auth.service.AuthService;
import hotelpms.common.security.AppUserDetailsService;
import hotelpms.common.security.JwtFilter;
import hotelpms.common.security.JwtService;
import hotelpms.common.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtFilter.class})
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private AppUserDetailsService userDetailsService;

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "clerk@hotel.local")
    void meReturnsAuthenticatedUser() throws Exception {
        var response = new MeResponse(
                UUID.fromString("1a2b3c4d-0000-4000-8000-000000000001"),
                "clerk@hotel.local",
                "Front Desk Clerk",
                "clerk",
                "CLERK",
                List.of("RESERVATION_READ")
        );
        when(authService.me("clerk@hotel.local")).thenReturn(response);

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("clerk@hotel.local"))
                .andExpect(jsonPath("$.role").value("CLERK"));

        verify(authService).me("clerk@hotel.local");
    }
}
