package info.itzjacky.FYP.Game;

import info.itzjacky.FYP.Storage.DigitalOceanStorageService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.lang.model.type.ArrayType;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static info.itzjacky.FYP.Game.GameGenre.getGenreFromString;
import static info.itzjacky.FYP.Game.Platform.getPlatformFromString;

@Service
public class GameService {

    @Autowired
    GameRepository gameRepository;

    Logger logger = LoggerFactory.getLogger(GameController.class);
    @Autowired
    private GameVersionRepository gameVersionRepository;

    @Autowired
    DigitalOceanStorageService storageService;

    public List<Game> getAllGames(){
        return gameRepository.findAll();
    }

    public Game addGame(GameRequest gameRequest){
        try{
            Game g = Game.builder()
                    .name(gameRequest.getName())
                    .description(gameRequest.getDescription())
                    .genre(gameRequest.getGenre())
                    .version(gameRequest.getGameVersion() == null ? "Latest" : gameRequest.getGameVersion().getVersion())
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
            throw new IllegalStateException("Failed to create Game");
        }
    }

    @Transactional
    public Game addGame(GameRequest gameRequest, MultipartFile icon){
        try{
            Game g = Game.builder()
                    .name(gameRequest.getName())
                    .description(gameRequest.getDescription())
                    .genre(gameRequest.getGenre())
                    .version(gameRequest.getGameVersion() == null ? "Latest" : gameRequest.getGameVersion().getVersion())
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

            updateGameIcon(g.getId().toString(), icon);
            gameRepository.save(g);

            return g;
        }catch (Exception e){
            throw new IllegalStateException("Failed to create Game");
        }
    }

    public Game findGameById(GameRequest gameRequest){
        try{
            return gameRepository.findGameById(gameRequest.getId());
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

    public List<Game> findGamesByDeveloperCompany(GameRequest gameRequest){
        try{
            return gameRepository.findGamesByDeveloperCompany(gameRequest.getDeveloperCompany());
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

    public List<Game> findGamesByDeveloperCompanyOrNameOrPublisherOrDescriptionOrGameGenreOrAndPlatforms(GameRequest gameRequest){
        try{
            List<GameGenre> genreList;
            List<Platform> platformList;
            try {
                genreList = GameGenre.getGenreFromString(gameRequest.getName());
            }catch (Exception e){
                genreList = null;
            }
            try{
                platformList = getPlatformFromString(gameRequest.getName());
            } catch (Exception e) {
                platformList = null;
            }
//            return gameRepository.findGamesByDeveloperCompanyOrNameOrPublisherOrDescriptionOrGameGenreOrAndPlatforms(
//                    gameRequest.getName(),
//                    genre,
//                    platform
//            );
//            return gameRepository.findGamesByDeveloperCompanyOrNameOrPublisherOrDescriptionOrGameGenreListOrAndPlatformsList(
////                    gameRequest.getName(),
//                    genreList
////                    platformList
//            );
            if(genreList == null) {
                logger.info("null");
            }else {
                logger.info("Game Request: " + genreList.toString());
            }

            if(platformList == null) {
                logger.info("null");
            }else {
                logger.info("Game Request: " + platformList.toString());
            }

            return gameRepository.findGamesByDeveloperCompanyOrNameOrPublisherOrDescriptionOrGameGenreListOrAndPlatformsList(
////                    gameRequest.getName(),
//                   platformList
                    Platform.STEAM
            );

        } catch (Exception e){
            e.printStackTrace();
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

    @Transactional
    public GameVersion addNewVersion(GameRequest gameRequest){
        if(gameRequest.getGameVersion() == null){
            throw new IllegalStateException("Version Detail Not Provided");
        }
        if(gameRequest.getId() == null){
            throw new IllegalStateException("Game Id Cannot be Null");
        }
        if(gameRequest.getGameVersion().getVersion().isEmpty()){
            throw new IllegalStateException("Version Cannot be Null or Empty");
        }
        if(gameRequest.getGameVersion().getUrl().isEmpty()){
            throw new IllegalStateException("Version URL Cannot be Null or Empty");
        }
        Game game = null;
        try {
            game = gameRepository.findGameById(gameRequest.getId());
        }catch (Exception e) {
            throw new IllegalStateException("Game Does Not Exist");
        }

        for(GameVersion version: game.getVersions()){
            if(version.getVersion().equals(gameRequest.getGameVersion().getVersion())){
                throw new IllegalStateException("Version Already Exists");
            }
        }

        try{
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
            if(gameRequest.getGameVersion().getReleaseDate() == null){
                gameRequest.getGameVersion().setReleaseDate(sdf.format(new Date()));
            } else {
                gameRequest.getGameVersion().setReleaseDate(sdf.format(gameRequest.getGameVersion().getReleaseDate()));
            }
            GameVersion gameVersion = GameVersion.builder().
                    versionedGame(game).
                    version(gameRequest.getGameVersion().getVersion()).
                    releaseDate(gameRequest.getGameVersion().getReleaseDate()).
                    url(gameRequest.getGameVersion().getUrl())
                    .build();
            gameVersionRepository.save(gameVersion);
            return gameVersion;
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

    public List<GameVersion> getAllVersions(GameRequest gameRequest) {
        try {
            return gameVersionRepository.findGameVersionsByVersionedGame(gameRepository.findGameById(gameRequest.getId()));
        }catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }


    public List<Game> findGamesByName(GameRequest gameRequest){
        try{
            return gameRepository.findGamesByName(gameRequest.getName());
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

    @Transactional
    public void updateGameIcon(String gameId, MultipartFile file) {
        Game game = gameRepository.findGameById(Integer.parseInt(gameId));

        if(game.getIconUrl() != null){
            storageService.deleteFile("games/" + game.getId() + "/icon.jpg");
        }
        storageService.uploadFile("games/" + game.getId() + "/icon.jpg", file);
        game.setIconUrl("games/" + game.getId() + "/icon.jpg");
        gameRepository.save(game);
    }

    public List<Game> findTopLatestGames(GameRequest gameRequest){
        try{
            if(gameRequest.getNumOfGames() == null || gameRequest.getNumOfGames() < 1){
                gameRequest.setNumOfGames(10);
            }
            return gameRepository.findAll(PageRequest.of(0, gameRequest.getNumOfGames(), Sort.by("createdAt").descending())).getContent();
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

    public List<Game> findTopMostReviewedGames(GameRequest gameRequest){
        try{
            if(gameRequest.getNumOfGames() == null || gameRequest.getNumOfGames() < 1){
                gameRequest.setNumOfGames(10);
            }
            return gameRepository.topMostReviewedGames(gameRequest.getNumOfGames());
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }
}
