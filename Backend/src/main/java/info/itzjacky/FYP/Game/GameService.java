package info.itzjacky.FYP.Game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public Game addNewVersion(GameRequest gameRequest){
        if(gameRequest.getId() == null){
            throw new IllegalStateException("Game Id Cannot be Null");
        }
        if(gameRequest.getVersion() == null || gameRequest.getVersion().isEmpty()){
            throw new IllegalStateException("Version Cannot be Null or Empty");
        }
        try{
            Game game = gameRepository.findGameById(gameRequest.getId());
            for(String version: game.getVersions()){
                if(version.equals(gameRequest.getVersion())){
                    throw new IllegalStateException("Version Already Exists");
                }
            }
            game.getVersions().add(gameRequest.getVersion());
            gameRepository.save(game);
            return game;
        }catch (Exception e){
            throw new IllegalStateException("Error Adding New Version to the Game");
        }
    }

    public void removeGame(Game game){
//        Optional<Game> g = gameRepository.findGameByNameAndDevelopers(game.getName(), game.getDevelopers());
//        if(!g.isPresent()){
//            throw new IllegalStateException("Game Does Not Exist");
//        } else {
//            gameRepository.delete(game);
//        }
    }

}
