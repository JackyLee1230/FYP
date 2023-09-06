package info.itzjacky.FYP.Controller;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Repository.GameRepository;
import info.itzjacky.FYP.Service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    GameService gameService;

    @GetMapping("/getAllGames")
    public List<Game> getAllGames(){
        return gameService.getAllGames();
    }

    @PostMapping("/addGame")
    public Game addGame(@RequestBody Game game){
        return gameService.addGame(game);
    }

    @PostMapping("/removeGame")
    public void removeGame(@RequestBody Game game){
        gameService.removeGame(game);
    }
}
