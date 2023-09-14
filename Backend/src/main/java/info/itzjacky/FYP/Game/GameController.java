package info.itzjacky.FYP.Game;

import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    GameService gameService;

    @GetMapping("/getAllGames")
    public ResponseEntity<List<Game>> getAllGames() {
        return new ResponseEntity<>(gameService.getAllGames(), HttpStatus.OK);
    }


    @PostMapping("/addGame")
    public ResponseEntity<Game> addGame(@RequestBody Game game) {
        try {
            return new ResponseEntity<>(gameService.addGame(game), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/addNewVersion")
    public ResponseEntity<Game> addNewVersion(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.addNewVersion(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/removeGame")
    public ResponseEntity<Void> removeGame(@RequestBody Game game) {
        try {
            gameService.removeGame(game);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
