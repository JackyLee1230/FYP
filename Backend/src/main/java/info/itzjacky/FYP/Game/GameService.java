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
import java.awt.print.Pageable;
import java.text.DateFormat;
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
            DateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd hh:mm:ss");
            Game g = Game.builder()
                    .name(gameRequest.getName())
                    .description(gameRequest.getDescription())
                    .genre(gameRequest.getGenre())
                    .isDLC(gameRequest.getIsDLC())
                    .isFree(gameRequest.getIsFree())
                    .legalNotice(gameRequest.getLegalNotice())
                    .gamePage(gameRequest.getGamePage())
                    .gamePrice(gameRequest.getGamePrice())
                    .requiredAge(gameRequest.getRequiredAge())
                    .version(gameRequest.getGameVersion() == null ? "Latest" : gameRequest.getGameVersion().getVersion())
                    .developerCompany(gameRequest.getDeveloperCompany())
                    .developers(gameRequest.getDevelopers())
                    .publisher(gameRequest.getPublisher())
                    .isInDevelopment(gameRequest.getIsInDevelopment())
                    .Tester(gameRequest.getTester())
                    .platforms(gameRequest.getPlatforms())
                    .releaseDate(dateFormat.format(new SimpleDateFormat("dd/MM/yyyy").parse(gameRequest.getReleaseDate())))
                    .gameReviews(null)
                    .build();
            gameRepository.save(g);
            return g;
        }catch (Exception e){
            e.printStackTrace();
            throw new IllegalStateException("Failed to create Game");
        }
    }

    public Game findGameByNameAndDeveloperCompany(GameRequest gameRequest){
        try{
            return gameRepository.findGameByNameAndAndDeveloperCompany(gameRequest.getName(), gameRequest.getDeveloperCompany()).orElseThrow(() -> new IllegalStateException("Game Does Not Exist"));
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }

    public Game updateGame(GameRequest gameRequest){
        try{
            Game g;
            if(gameRequest.getId() != null){
                g =  gameRepository.findGameById(gameRequest.getId());
            } else if (gameRequest.getName() != null && gameRequest.getDeveloperCompany() != null){
                g = gameRepository.findGameByNameAndAndDeveloperCompany(gameRequest.getName(), gameRequest.getDeveloperCompany()).orElseThrow(() -> new IllegalStateException("Game Does Not Exist"));
            } else {
                throw new IllegalStateException("Provide gameid / name+ developer company");
            }
            g.setName(gameRequest.getName() == null ? g.getName() : gameRequest.getName());
            g.setDescription(gameRequest.getDescription() == null ? g.getDescription() : gameRequest.getDescription());
            g.setGenre(gameRequest.getGenre() == null ? g.getGenre() : gameRequest.getGenre());
            g.setDLC(gameRequest.getIsDLC());
            g.setFree(gameRequest.getIsFree());
            g.setLegalNotice(gameRequest.getLegalNotice() == null ? g.getLegalNotice() : gameRequest.getLegalNotice());
            g.setGamePage(gameRequest.getGamePage() == null ? g.getGamePage() : gameRequest.getGamePage());
            g.setGamePrice(gameRequest.getGamePrice() == null ? g.getGamePrice() : gameRequest.getGamePrice());
            g.setRequiredAge(gameRequest.getRequiredAge() == null ? g.getRequiredAge() : gameRequest.getRequiredAge());
            g.setVersion(gameRequest.getGameVersion() == null ? g.getVersion() : gameRequest.getGameVersion().getVersion());
            g.setDeveloperCompany(gameRequest.getDeveloperCompany() == null ? g.getDeveloperCompany() : gameRequest.getDeveloperCompany());
            g.setDevelopers(gameRequest.getDevelopers() == null ? g.getDevelopers() : gameRequest.getDevelopers());
            g.setPublisher(gameRequest.getPublisher() == null ? g.getPublisher() : gameRequest.getPublisher());
            g.setInDevelopment(gameRequest.getIsInDevelopment());
            g.setTester(gameRequest.getTester() == null ? g.getTester() : gameRequest.getTester());
            g.setPlatforms(gameRequest.getPlatforms() == null ? g.getPlatforms() : gameRequest.getPlatforms());
            g.setReleaseDate(gameRequest.getReleaseDate() == null ? g.getReleaseDate() : gameRequest.getReleaseDate());
            gameRepository.save(g);
            return g;
        }catch (Exception e){
            throw new IllegalStateException("Failed to update Game");
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
                    .isInDevelopment(gameRequest.getIsInDevelopment())
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

    public Page<Game> findGamesByNamePaged(GameRequest gameRequest){
        try{
            if(gameRequest.getGamesPerPage() == null || gameRequest.getGamesPerPage() < 0 ){
                gameRequest.setGamesPerPage(5);
            }
            if(gameRequest.getPageNum() == null || gameRequest.getPageNum() < 0 ){
                gameRequest.setPageNum(0);
            }
            return gameRepository.findGamesByNamePaged(gameRequest.getName(), PageRequest.of(gameRequest.getPageNum(), gameRequest.getGamesPerPage()));
        } catch (Exception e){
            throw new IllegalStateException("Game Does Not Exist");
        }
    }



//    only input 1 platform
    public List<Game> findGamesByPlatform(GameRequest gameRequest){
        try{
            return gameRepository.findGamesByPlatforms(gameRequest.getPlatforms().get(0));
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

    public Long countByName(GameRequest gameRequest) {
        try{
            return gameRepository.countByName(gameRequest.getName());
        } catch (Exception e){
            throw new IllegalStateException("Error finding games");
        }
    }
}
