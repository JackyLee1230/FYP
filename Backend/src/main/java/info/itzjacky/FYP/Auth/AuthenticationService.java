package info.itzjacky.FYP.Auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import info.itzjacky.FYP.User.Role;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserController;
import info.itzjacky.FYP.User.UserRepository;
import info.itzjacky.FYP.Utils.Others;
import info.itzjacky.FYP.Utils.RegEx;
import info.itzjacky.FYP.config.JwtService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${application.web.url}")
    private String webUrl;

    Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) throws MessagingException, UnsupportedEncodingException {
        if(!RegEx.emailValidation(request.getEmail().toLowerCase())){
            throw new IllegalStateException("Invalid Email format");
        }
        var user = repository.findUserByEmail(request.getEmail());
        if (user == null) {
            throw new IllegalStateException("User does not exist");
        }
        String token = UUID.randomUUID().toString().replace("-", "");
        sendResetPasswordEmail(request.getEmail(), token);
        user.setResetPasswordToken(token);
//        2 hours expiry
        user.setResetPasswordExpires(new Date(System.currentTimeMillis() + 7200000));
        repository.save(user);
        return "Email Sent";
    }

    public void sendResetPasswordEmail(String email, String token)
    throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("critiqplatform@gmail.com", "CritiQ Support");
        helper.setTo(email);

        String subject = "CritiQ: Reset Password";

        String content = "<p>Hello,</p>"
                + "<p>You have requested to reset your password.</p>"
                + "<p>Click the link below to reset your password:</p>"
                + "<p><a href=\"" + webUrl + "/reset-password/" + token + "\">Reset Password</a></p>"
                + "<br>"
                + "<p>Ignore this email if you did not request to reset your password.</p>"
                + "<p>This password reset request will expire after 2 hours.</p>";
        helper.setSubject(subject);
        helper.setText(content, true);
        javaMailSender.send(message);
    }

    public void sendVerifyEmail(String email, String token)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom("critiqplatform@gmail.com", "CritiQ Support");
        helper.setTo(email);

        String subject = "CritiQ: Verify Account";

        String content = "<p>Hello,</p>"
                + "<p>You have registered an account with CritiQ.</p>"
                + "<p>Click the link below to verify your account:</p>"
                + "<p><a href=\"" + webUrl + "/verify/" + token + "\">Verify Account</a></p>"
                + "<br>"
                + "<p>Ignore this email if you did not registered on our platform.</p>";
        helper.setSubject(subject);
        helper.setText(content, true);
        logger.info(webUrl + "/verify/" + token);
        javaMailSender.send(message);
    }


    @Transactional
    public AuthenticationResponse register(RegisterRequest request) throws MessagingException, UnsupportedEncodingException {
        if(!RegEx.emailValidation(request.getEmail().toLowerCase())){
            throw new IllegalStateException("Invalid Email format");
        }
        if(!RegEx.passwordValidation(request.getPassword())){
            throw new IllegalStateException("Password Must Be 8-16 Characters Long, Contain At Least 1 Letter And 1 Number");
        }
        if (repository.findUserByName(request.getName()) != null) {
            throw new IllegalStateException("User already exists");
        }
        if (repository.findUserByEmail(request.getEmail()) != null) {
            throw new IllegalStateException("Email already used by another user");
        }
        DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        Date date = null;
        try {
            date = formatter.parse(request.getBirthday());
        } catch (java.text.ParseException e) {
            e.printStackTrace();
        }
        long diff = new Date().getTime() - date.getTime();
        long age = diff / (24 * 60 * 60 * 1000) / 365;
        request.setAge((int) age);
        String token = UUID.randomUUID().toString().replace("-", "");
        var user = User.builder()
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .birthday(date)
                .ageGroup(Others.getAgeGroupFromAge((int) age))
                .gender(request.getGender())
                .isPrivate(false)
                .role(List.of(Role.USER))
                .verificationToken(token)
                .isVerified(false)
                .build();
        var savedUser = repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        sendVerifyEmail(request.getEmail(), token);
        saveUserToken(savedUser, jwtToken);
        return AuthenticationResponse.builder().user(savedUser).accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    @Transactional
    public AuthenticationResponse login(LoginRequest request) {
//        if name contains '@', then find user by email
        User user = null;
        if (request.getName().contains("@")) {
            user = repository.findUserByEmail(request.getName());
            if (user == null) {
                throw new IllegalStateException("User does not exist");
            }
        } else {
            user = repository.findUserByName(request.getName());
            if (user == null) {
                throw new IllegalStateException("User does not exist");
            }
        }
        try{
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getName(),
                        request.getPassword()
                )
        );}
        catch (org.springframework.security.core.AuthenticationException e ){
            throw new IllegalStateException("Incorrect Password");
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        user.setLastActive(new Date());
        userRepository.save(user);
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
            var user = this.repository.findUserByName(username);
            if (user == null) {
                throw new IllegalStateException("User does not exist");
            }
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
