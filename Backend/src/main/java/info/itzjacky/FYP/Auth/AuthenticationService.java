package info.itzjacky.FYP.Auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import info.itzjacky.FYP.User.Role;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserRepository;
import info.itzjacky.FYP.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(List.of(Role.USER))
                .build();
        var savedUser = repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(savedUser, jwtToken);
        return AuthenticationResponse.builder().user(savedUser).accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    @Transactional
    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getName(),
                        request.getPassword()
                )
        );
        var user = repository.findUserByName(request.getName()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
//        remove old tokens that are more than 2 weeks old
        tokenRepository.deleteAllByCreatedAtBefore(new Date(System.currentTimeMillis() - 1209600000));
        return AuthenticationResponse.builder().user(user).accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    private void revokeAllUserTokens(User user) {
        var tokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if(tokens.isEmpty()){
            return;
        }
        tokens.forEach(token -> {
            token.setRevoked(true);
            token.setExpired(true);
        });
        tokenRepository.saveAll(tokens);
    }


    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .revoked(false)
                .expired(false)
                .build();
        tokenRepository.save(token);
    }

    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws java.io.IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String username;
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        username = jwtService.extractUsername(refreshToken);
        if (username != null) {
            var user = this.repository.findUserByName(username)
                    .orElseThrow();
            if (jwtService.isTokenVald(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }
}
