package info.itzjacky.FYP.Game;

import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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

    @GetMapping("/getAllGameGenres")
    public ResponseEntity<List<GameGenre>> getAllGameGenres() {
        return new ResponseEntity<>(GameGenre.getAllGenres(), HttpStatus.OK);
    }


    @PostMapping("/addGame")
    public ResponseEntity<Game> addGame(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.addGame(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/addNewVersion")
    public ResponseEntity<GameVersion> addNewVersion(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.addNewVersion(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping(value = "/updateGameIcon", consumes = MediaType.ALL_VALUE, produces = MediaType.ALL_VALUE)
    public ResponseEntity<String> updateGameIcon(@RequestParam("gameId") String gameId, @RequestBody MultipartFile file) {
        try {
            gameService.updateGameIcon(gameId, file);
            return new ResponseEntity<>("Successfully uploaded", HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    @PostMapping("/getAllVersions")
    public ResponseEntity<List<GameVersion>> getAllVersions(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getAllVersions(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/removeGame")
    public ResponseEntity<Void> removeGame(@RequestBody GameRequest gameRequest) {
        try {
            gameService.removeGame(gameRequest);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGamesByName")
    public ResponseEntity<List<Game>> findGamesByName(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGamesByName(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGameById")
    public ResponseEntity<Game> findGameById(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGameById(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }
}
