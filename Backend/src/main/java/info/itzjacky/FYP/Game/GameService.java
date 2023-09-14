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

    public Game addGame(GameRequest gameRequest){
        try{
            Game g = Game.builder()
                    .name(gameRequest.getName())
                    .description(gameRequest.getDescription())
                    .genre(gameRequest.getGenre())
                    .versions(List.of(gameRequest.getVersion()))
                    .developerCompany(gameRequest.getDeveloperCompany())
                    .developers(gameRequest.getDevelopers())
                    .publisher(gameRequest.getPublisher())
                    .isInDevelopment(gameRequest.isInDevelopment())
                    .Tester(gameRequest.getTester())
                    .platforms(gameRequest.getPlatforms())
                    .releaseDate(gameRequest.getReleaseDate())
                    .gameReviews(null)
                    .build();
            gameRepository.save(g);
            return g;
        }catch (Exception e){
            e.printStackTrace();
            throw new IllegalStateException("Failed to create Game");
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

    /*
    arg: Integer (Game.id)
     */
    public void removeGame(GameRequest game){
        try{
            gameRepository.delete(gameRepository.findGameById(game.getId()));
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

}
