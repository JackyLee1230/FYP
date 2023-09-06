package info.itzjacky.FYP.Service;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GameService {

    @Autowired
    GameRepository gameRepository;

    public List<Game> getAllGames(){
        return gameRepository.findAll();
    }

    public Game addGame(Game game){
        try{
            gameRepository.save(game);
            return game;
        }catch (Exception e){
            return null;
        }
    }

    public void removeGame(Game game){
        Optional<Game> g = gameRepository.findGameByNameAndDeveloper(game.getName(), game.getDeveloper());
        if(!g.isPresent()){
            throw new IllegalStateException("Game Does Not Exist");
        } else {
            gameRepository.delete(game);
        }
    }

}
