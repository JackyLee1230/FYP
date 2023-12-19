package info.itzjacky.FYP.Game;

import com.fasterxml.jackson.databind.util.JSONPObject;
import info.itzjacky.FYP.Review.Review;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    GameService gameService;

    Logger logger = LoggerFactory.getLogger(GameController.class);
    @Autowired
    private GameRepository gameRepository;

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/addDeveloperToGame")
    public ResponseEntity<Boolean> addDeveloperToGame(@RequestBody GameRequest gameRequest) {
        try {
            Boolean result = gameService.addDeveloperToGame(gameRequest);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @GetMapping("/getAllGames")
    public ResponseEntity<List<Game>> getAllGames() {
        return new ResponseEntity<>(gameService.getAllGames(), HttpStatus.OK);
    }

    @GetMapping("/getAllGameGenres")
    public ResponseEntity<List<Map<String, Integer>>> getAllGameGenres() {
        return new ResponseEntity<>(GameGenre.getAllGenres(), HttpStatus.OK);
    }

    @GetMapping("/getAllGamePlatforms")
    public ResponseEntity<List<Map<String, Integer>>> getAllGamePlatforms() {
        return new ResponseEntity<>(Platform.getAllPlatforms(), HttpStatus.OK);
    }

    @PostMapping("/addGame")
    public ResponseEntity<Game> addGame(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.addGame(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/updateGame")
    public ResponseEntity<Game> updateGame(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.updateGame(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGameByNameAndDeveloperCompany")
    public ResponseEntity<Game> findGameByNameAndDeveloperCompany(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGameByNameAndDeveloperCompany(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/addGameWithIcon")
    public ResponseEntity<Game> addGame(@RequestPart("data") GameRequest gameRequest, @RequestPart("icon") MultipartFile icon) {
        try {
            logger.info("Creating game with icon");
            return new ResponseEntity<>(gameService.addGame(gameRequest, icon), HttpStatus.OK);
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

    @PostMapping(value = "/updateGameIcon/{gameId}", consumes = MediaType.ALL_VALUE, produces = MediaType.ALL_VALUE)
    public ResponseEntity<String> updateGameIcon(@PathVariable String gameId, @RequestBody MultipartFile file) {
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

    @Cacheable("findGamesByName")
    @PostMapping("/findGamesByName")
    public ResponseEntity<List<Game>> findGamesByName(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGamesByName(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGamesByNamePaged")
    public ResponseEntity<Page<Game>> findGamesByNamePaged(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGamesByNamePaged(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGameById")
    public ResponseEntity<Game> findGameById(@RequestBody GameRequest gameRequest) {
        try {
            logger.info(String.valueOf(gameRequest));
            Game g = gameService.findGameById(gameRequest);
            if (g.getBaseGame() != null) {
                g.getBaseGame().setGameReviews(null);
            }
            if (gameRequest.getIncludeReviews() != null && !gameRequest.getIncludeReviews()) {
                g.setGameReviews(null);
            }
            for (Review review : g.getGameReviews()) {
                review.getReviewer().setReviews(null);
                review.setReviewedGame(null);
                review.getReviewer().setDevelopedGames(null);
                review.getReviewer().setLikedReviews(null);
                review.getReviewer().setDislikedReviews(null);
            }
//            find DLC games that have base game id of this game
            if (!g.isDLC()) {
                List<Game> DLCS = gameRepository.findGamesByBaseGame(g.getId());
                for (Game DLC : DLCS) {
                    DLC.setGameReviews(null);
                    DLC.setBaseGame(null);
                }
                g.setDLCS(DLCS);
            } else {
                g.setDLCS(null);
            }

            if (gameRequest.getIncludePlatformReviews() != null && gameRequest.getIncludePlatformReviews() == true) {
                List<PlatformReview> platformReviews = new ArrayList<>();
                HashMap<Platform, PlatformReview> pHashmap = new HashMap<>();
                for(Platform p: g.getPlatforms()) {
                    PlatformReview platformReview = new PlatformReview();
                    platformReview.setPlatform(p);
                    platformReview.setAverage(0.0);
                    platformReview.setReviewCount(0);
                    pHashmap.put(p, platformReview);
                }
                for (Review review : g.getGameReviews()) {
                    Platform p = review.getPlatform();
                    if (p == null) {
                        continue;
                    }
                    PlatformReview platformReview = pHashmap.get(p);
                    platformReview.setAverage((platformReview.getAverage() * platformReview.getReviewCount() + review.getScore())/ (platformReview.getReviewCount() + 1));
                    platformReview.setReviewCount(platformReview.getReviewCount() + 1);
                }
                for (Map.Entry<Platform, PlatformReview> entry : pHashmap.entrySet()) {
                    platformReviews.add(entry.getValue());
                }
                g.setPlatformReviews(platformReviews);
            }

            return new ResponseEntity<>(g, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGamesByPlatform")
    public ResponseEntity<List<Game>> findGamesByPlatform(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGamesByPlatform(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGamesByDeveloperCompany")
public ResponseEntity<List<Game>> findGamesByDeveloperCompany(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.findGamesByDeveloperCompany(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGamesWithSearch")
    public ResponseEntity<List<Game>> findGamesWithSearch(@RequestBody GameRequest gameRequest) {
        try {
            logger.info(gameRequest.toString());
            return new ResponseEntity<>(gameRepository.customFindGames(gameRequest.getName(),gameRequest.getPlatforms(), gameRequest.getGenre(), gameRequest.getIsInDevelopment(), gameRequest.getOrderedByScore(), gameRequest.getOrderedByReleaseDate()), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/findGamesWithSearchDeveloper")
    public ResponseEntity<List<Game>> findGamesWithSearchDeveloper(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameRepository.customFindGamesDeveloper(gameRequest.getName(),gameRequest.getPlatforms(), gameRequest.getGenre(), gameRequest.getIsInDevelopment(), gameRequest.getOrderedByScore(), gameRequest.getOrderedByReleaseDate()), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getTopLatestGames")
    public ResponseEntity<List<Game>> getTop10LatestGames(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getTopLatestGames(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getTopMostReviewedGames")
    public ResponseEntity<List<Game>> findTop10MostReviewedGames(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getTopMostReviewedGames(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

}
