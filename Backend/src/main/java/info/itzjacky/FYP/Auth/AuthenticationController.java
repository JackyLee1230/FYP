package info.itzjacky.FYP.Auth;

import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.User.UserService;
import info.itzjacky.FYP.Utils.Others;
import info.itzjacky.FYP.Utils.RegEx;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private UserService userService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) throws MessagingException, UnsupportedEncodingException {
        return ResponseEntity.ok(authenticationService.forgotPassword(request));
    }

    @PostMapping("/userAuth")
    public ResponseEntity<User> userAuth(Principal principal){
        User u = userService.getUserFromPrincipal(principal);
        if (u == null) {
            throw new IllegalStateException("User does not exist");
        } else {
            return ResponseEntity.ok(u);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<User> resetPassword(@RequestBody ResetPasswordRequest request){
        User u = userService.getUserByResetPasswordToken(request.getResetPasswordToken());
        if (u == null || u.getResetPasswordExpires().before(new java.util.Date())) {
            throw new IllegalStateException("Token Expired/Invalid");
        }
        return ResponseEntity.ok(userService.updatePassword(u, request.getPassword()));
    }


    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) throws MessagingException, UnsupportedEncodingException {
        return ResponseEntity.ok(authenticationService.register(request));
    }


    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/refreshToken")
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        authenticationService.refreshToken(request, response);
    }

}
