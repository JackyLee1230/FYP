package info.itzjacky.FYP.Game;

import com.fasterxml.jackson.databind.util.JSONPObject;
import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.Review.ReviewRepository;
import info.itzjacky.FYP.User.Gender;
import info.itzjacky.FYP.User.User;
import info.itzjacky.FYP.Utils.Others;
import jakarta.transaction.Transactional;
import jdk.jfr.TransitionTo;
import org.json.JSONArray;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.text.SimpleDateFormat;
import java.util.*;

import static info.itzjacky.FYP.Utils.Others.sentimentMapper;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    GameService gameService;

    Logger logger = LoggerFactory.getLogger(GameController.class);
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private ReviewRepository reviewRepository;

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
            e.printStackTrace();
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

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/removeGame")
    public ResponseEntity<Void> removeGame(@RequestBody GameRequest gameRequest, @AuthenticationPrincipal User u) {
//        check if user has role ADMIN
//        log the user roles
        logger.info(u.getRole().toString());
//        if (u.getRole().contains("ADMIN") == false) {
//            throw new ResponseStatusException(HttpStatusCode.valueOf(400), "User does not have permission to remove game");
//        }
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
            Game g = gameService.findGameById(gameRequest);
            if (g.getBaseGame() != null) {
                g.getBaseGame().setGameReviews(null);
            }
            if (gameRequest.getIncludeReviews() != null && !gameRequest.getIncludeReviews()) {
                g.setGameReviews(null);
            }
            if (gameRequest.getIncludeReviews() == null || gameRequest.getIncludeReviews()) {
                for (Review review : g.getGameReviews()) {
                    review.getReviewer().setReviews(null);
                    review.setReviewedGame(null);
                    review.getReviewer().setDevelopedGames(null);
                    review.getReviewer().setTestedGames(null);
                    review.getReviewer().setLikedReviews(null);
                    review.getReviewer().setDislikedReviews(null);
//                for each review's likes, add it to an arraylist of integer
                    List<Integer> likes = new ArrayList<>();
                    List<Integer> dislikes = new ArrayList<>();
                    for (User u : review.getLikes()) {
                        likes.add(u.getId());
                    }
                    for (User u : review.getDislikes()) {
                        dislikes.add(u.getId());
                    }
                    review.setLikedUsers(likes);
                    review.setDislikedUsers(dislikes);
                    review.setLikes(null);
                    review.setDislikes(null);
                }
            }

//            find DLC games that have base game id of this game
            if (!g.isDLC()) {
                List<Game> DLCS = gameRepository.findGamesByBaseGame(g.getId());
                for (Game DLC : DLCS) {
                    DLC.setGameReviews(null);
                    DLC.setBaseGame(null);
                }
                DLCS.sort((o1, o2) -> {
                    if (o1.getReleaseDate() == null || o2.getReleaseDate() == null) {
                        return 0;
                    }
                    return o1.getReleaseDate().compareTo(o2.getReleaseDate());
                });
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

    @PostMapping("/getTopFavouritedGames")
    public ResponseEntity<List<Game>> getTopFavouritedGames(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getTopFavouritedGames(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getTopWishlistedGames")
    public ResponseEntity<List<Game>> getTopWishlistedGames(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getTopWishlistedGames(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
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

    @PostMapping("/getTopRecentlyReleasedGames")
    public ResponseEntity<List<Game>> findTop10RecentlyReleasedGames(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getTopRecentlyReleasedGames(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }

    @PostMapping("/getTopMostReviewedInDevelopmentGame")
    public ResponseEntity<List<Game>> findTop10MostReviewedInDevelopmentGame(@RequestBody GameRequest gameRequest) {
        try {
            return new ResponseEntity<>(gameService.getTopMostReviewedInDevelopmentGame(gameRequest), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }
    }


    @Transactional
    @PostMapping(path="/gameAnalytic", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> gameAnalytic(@RequestBody GameRequest gameRequest) {
        try {
            if (gameRequest == null || gameRequest.getId() == null) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Game id is required");
            }
            JSONObject jsonObject = new JSONObject();
            Game game = gameRepository.findGameById(gameRequest.getId());

            if (game == null) {
                throw new ResponseStatusException(HttpStatusCode.valueOf(400), "Game not found");
            }

            if (game.getAnalyticUpdatedAt() != null && game.getAnalyticUpdatedAt().after(new Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000))) {
                return new ResponseEntity<String>(game.getAnalytic(), HttpStatus.OK);
            }

            List<Review> reviews = reviewRepository.findReviewsByGameId(gameRequest.getId());
            HashMap<String, Integer> genderCount = new HashMap<>();
            genderCount.put("MALE", 0);
            genderCount.put("FEMALE", 0);
            genderCount.put("OTHER", 0);
            genderCount.put("UNDISCLOSED", 0);
            genderCount.put("N/A", 0);

            HashMap<String, Integer> ageCount = new HashMap<>();
            ageCount.put("13-19", 0);ageCount.put("20-29", 0);ageCount.put("30-39", 0);ageCount.put("40-49", 0);ageCount.put("50-59", 0);
            ageCount.put("60-69", 0);ageCount.put("70-79", 0);ageCount.put("80-89", 0);ageCount.put("90-99", 0);ageCount.put("N/A", 0);

            HashMap<String, Integer> sentimentCount = new HashMap<>();
            sentimentCount.put("POSITIVE", 0);
            sentimentCount.put("NEGATIVE", 0);
            sentimentCount.put("N/A", 0);

            HashMap<String, Integer> recommendedCount = new HashMap<>();
            recommendedCount.put("RECOMMEND", 0);
            recommendedCount.put("DO NOT RECOMMEND", 0);

            HashMap<String, Integer> reviewLength = new HashMap<>();
            reviewLength.put("0-100", 0);reviewLength.put("100-200", 0);reviewLength.put("200-300", 0);reviewLength.put("300-400", 0);reviewLength.put("400-500", 0);
            reviewLength.put("500-600", 0);reviewLength.put("600-700", 0);reviewLength.put("700-800", 0);reviewLength.put("800-900", 0);reviewLength.put("900-1000", 0);
            reviewLength.put("1000+", 0);

            HashMap<GameGenre, Integer> reviewedPlatform = new HashMap<>();
            for (GameGenre g: game.getGenre()) {
                reviewedPlatform.put(g, 0);
            }

            HashMap<String, Integer> playTime = new HashMap<>();
            playTime.put("<1 Hour", 0);playTime.put("1-20 Hours", 0);playTime.put("20-50 Hours", 0);playTime.put("50-100 Hours", 0);
            playTime.put("100+ Hours", 0);playTime.put("N/A", 0);

            HashMap<String, Integer> positiveMap = new HashMap<>();
            positiveMap.put("MALE", 0);positiveMap.put("FEMALE", 0);
            positiveMap.put("OTHER", 0);positiveMap.put("UNDISCLOSED", 0);positiveMap.put("N/A", 0);
            HashMap<String, Integer> negativeMap = new HashMap<>();
            negativeMap.put("MALE", 0);negativeMap.put("FEMALE", 0);
            negativeMap.put("OTHER", 0);negativeMap.put("UNDISCLOSED", 0);negativeMap.put("N/A", 0);

            HashMap<String, Integer> positiveByAge = new HashMap<>();
            positiveByAge.put("13-19", 0);positiveByAge.put("20-29", 0);positiveByAge.put("30-39", 0);positiveByAge.put("40-49", 0);positiveByAge.put("50-59", 0);
            positiveByAge.put("60-69", 0);positiveByAge.put("70-79", 0);positiveByAge.put("80-89", 0);positiveByAge.put("90-99", 0);positiveByAge.put("N/A", 0);
            HashMap<String, Integer> negativeByAge = new HashMap<>();
            negativeByAge.put("13-19", 0);negativeByAge.put("20-29", 0);negativeByAge.put("30-39", 0);negativeByAge.put("40-49", 0);negativeByAge.put("50-59", 0);
            negativeByAge.put("60-69", 0);negativeByAge.put("70-79", 0);negativeByAge.put("80-89", 0);negativeByAge.put("90-99", 0);negativeByAge.put("N/A", 0);

            HashMap<String, HashMap> sentimentCountByGender = new HashMap<>();
            sentimentCountByGender.put("POSITIVE", positiveMap);
            sentimentCountByGender.put("NEGATIVE", negativeMap);

            HashMap<String, HashMap> sentimentCountByAge = new HashMap<>();
            sentimentCountByAge.put("POSITIVE", positiveByAge);
            sentimentCountByAge.put("NEGATIVE", negativeByAge);

            // array of [name, age, gender]
            List<List<String>> fav = gameRepository.findUsersThatFavouritedGame(gameRequest.getId());
            List<List<String>> wish = gameRepository.findUsersThatWishlistedGame(gameRequest.getId());

            HashMap<String, Integer> favouriteByAge = new HashMap<>();
            favouriteByAge.put("13-19", 0);favouriteByAge.put("20-29", 0);favouriteByAge.put("30-39", 0);favouriteByAge.put("40-49", 0);favouriteByAge.put("50-59", 0);
            favouriteByAge.put("60-69", 0);favouriteByAge.put("70-79", 0);favouriteByAge.put("80-89", 0);favouriteByAge.put("90-99", 0);favouriteByAge.put("N/A", 0);
            HashMap<String, Integer> favouriteByGender = new HashMap<>();
            favouriteByGender.put("MALE", 0);favouriteByGender.put("FEMALE", 0);
            favouriteByGender.put("OTHER", 0);favouriteByGender.put("UNDISCLOSED", 0);favouriteByGender.put("N/A", 0);

            HashMap<String, Integer> wishlistByAge = new HashMap<>();
            wishlistByAge.put("13-19", 0);wishlistByAge.put("20-29", 0);wishlistByAge.put("30-39", 0);wishlistByAge.put("40-49", 0);wishlistByAge.put("50-59", 0);
            wishlistByAge.put("60-69", 0);wishlistByAge.put("70-79", 0);wishlistByAge.put("80-89", 0);wishlistByAge.put("90-99", 0);wishlistByAge.put("N/A", 0);
            HashMap<String, Integer> wishlistByGender = new HashMap<>();
            wishlistByGender.put("MALE", 0);wishlistByGender.put("FEMALE", 0);
            wishlistByGender.put("OTHER", 0);wishlistByGender.put("UNDISCLOSED", 0);wishlistByGender.put("N/A", 0);

            for (List<String> userArr: fav) {
                String ageGroup = userArr.get(1);
                String favGender = userArr.get(2);
                String genderGroup = null;
                if (favGender != null) {
                    genderGroup = Gender.getById(Integer.valueOf(favGender));
                } else {
                    genderGroup = "N/A";
                }
                if (ageGroup == null || ageGroup.isEmpty() || ageGroup.equals("NA") || ageGroup.equals("N/A")) {
                    favouriteByAge.put("N/A", favouriteByAge.get("N/A") + 1);
                } else {
                    favouriteByAge.put(ageGroup, favouriteByAge.get(ageGroup) + 1);
                }
                if (favGender == null || favGender.isEmpty() || favGender.equals("NA") || favGender.equals("N/A")) {
                    favouriteByGender.put("N/A", favouriteByGender.get("N/A") + 1);
                } else {
                    favouriteByGender.put(genderGroup, favouriteByGender.get(genderGroup) + 1);
                }
            }

            for (List<String> userArr: wish) {
                String ageGroup = userArr.get(1);
                String wishGender = userArr.get(2);
                String genderGroup = null;
                if (wishGender != null) {
                    genderGroup = Gender.getById(Integer.valueOf(wishGender));
                } else {
                    genderGroup = "N/A";
                }

                if (ageGroup == null || ageGroup.isEmpty() || ageGroup.equals("NA") || ageGroup.equals("N/A")) {
                    wishlistByAge.put("N/A", wishlistByAge.get("N/A") + 1);
                } else {
                    wishlistByAge.put(ageGroup, wishlistByAge.get(ageGroup) + 1);
                }
                if (wishGender == null || wishGender.isEmpty() || wishGender.equals("NA") || wishGender.equals("N/A")) {
                    wishlistByGender.put("N/A", wishlistByGender.get("N/A") + 1);
                } else {
                    wishlistByGender.put(genderGroup, wishlistByGender.get(genderGroup) + 1);
                }
            }


            JSONObject topicFreq = new JSONObject();
//            topic freq has the following format {topidId: name: name, freq: freq}
            for (Review r: reviews) {
//                TOPICS to TOPIC FREQUENCY
                String reviewTopics = r.getTopics();
                if(reviewTopics != null && !reviewTopics.isEmpty()){
                    JSONObject topics = new JSONObject(reviewTopics);
                    for (String key : topics.keySet()) {
                        if (topicFreq.has(key)) {
                            JSONObject temp = new JSONObject();
                            JSONArray tempArray = (JSONArray) topics.get(key);
                            temp.put("name", tempArray.get(0));
                            temp.put("freq", topicFreq.getJSONObject(key).getInt("freq") + 1);
//                            update and remove the old
                            topicFreq.remove(key);
                            topicFreq.put(key, temp);

                        } else {
                            JSONObject temp = new JSONObject();
                            JSONArray tempArray = (JSONArray) topics.get(key);
                            temp.put("name", tempArray.get(0));
                            temp.put("freq", 1);
                            topicFreq.put(key, temp);
                        }
                    }
                }

//                PLATFORM
                GameGenre genre = r.getReviewedGame().getGenre().get(0);
                reviewedPlatform.put(genre, reviewedPlatform.get(genre) + 1);

//                PLAYTIME
//                given the review time is in minues, convert it for the folling sections
//                playTime.put("<1 Hour", 0);playTime.put("1-20 Hours", 0);playTime.put("20-50 Hours", 0);playTime.put("50-100 Hours", 0);
//                playTime.put("100+ Hours", 0);
                Integer playTimeStr = r.getPlayTime();
                if (playTimeStr == null) {
                    playTime.put("N/A", playTime.get("N/A") + 1);
                } else if (playTimeStr <= 60) {
                    playTime.put("<1 Hour", playTime.get("<1 Hour") + 1);
                } else if (playTimeStr <= 1200) {
                    playTime.put("1-20 Hours", playTime.get("1-20 Hours") + 1);
                } else if (playTimeStr <= 3000) {
                    playTime.put("20-50 Hours", playTime.get("20-50 Hours") + 1);
                } else if (playTimeStr <= 6000) {
                    playTime.put("50-100 Hours", playTime.get("50-100 Hours") + 1);
                } else {
                    playTime.put("100+ Hours", playTime.get("100+ Hours") + 1);
                }

//                GENDER
                Gender g = r.getReviewer().getGender();
                if (g == null) {
                    genderCount.put("N/A", genderCount.get("N/A") + 1);
                } else {
                    genderCount.put(r.getReviewer().getGender().toString(), genderCount.get(r.getReviewer().getGender().toString()) + 1);
                }
//                AGE
                String age = r.getReviewer().getAge();
                if (age == null || age.isEmpty() || age.equals("NA")) {
                    ageCount.put("N/A", ageCount.get("N/A") + 1);
                } else {
                    String tempAgeGroup = Others.getAgeGroupFromAge(Integer.valueOf(age));
                    if (tempAgeGroup.equals("NA")) {
                        ageCount.put("N/A", ageCount.get("N/A") + 1);
                    } else {
                        ageCount.put(tempAgeGroup, ageCount.get(tempAgeGroup) + 1);
                    }
                }
//                SENTIMENT
                Integer sentiment = r.getSentiment();
                if (sentiment == null) {
                    sentimentCount.put("N/A", sentimentCount.get("N/A") + 1);
                } else {
                    String s = sentimentMapper(r.getSentiment());
                    sentimentCount.put(s, sentimentCount.get(s) + 1);
                }
//                RECOMMEND
                Boolean userSentiment = r.isRecommended();
                if (userSentiment.equals(true)) {
                    recommendedCount.put("RECOMMEND", recommendedCount.get("RECOMMEND") + 1);
                } else {
                    recommendedCount.put("DO NOT RECOMMEND", recommendedCount.get("DO NOT RECOMMEND") + 1);
                }
//                REVIEW LENGTH (WORD COUNT)
                String comment = r.getComment();
                int wordCount = comment.split("\\s+").length;
                if (wordCount <= 100) {
                    reviewLength.put("0-100", reviewLength.get("0-100") + 1);
                } else if (wordCount <= 200) {
                    reviewLength.put("100-200", reviewLength.get("100-200") + 1);
                } else if (wordCount <= 300) {
                    reviewLength.put("200-300", reviewLength.get("200-300") + 1);
                } else if (wordCount <= 400) {
                    reviewLength.put("300-400", reviewLength.get("300-400") + 1);
                } else if (wordCount <= 500) {
                    reviewLength.put("400-500", reviewLength.get("400-500") + 1);
                } else if (wordCount <= 600) {
                    reviewLength.put("500-600", reviewLength.get("500-600") + 1);
                } else if (wordCount <= 700) {
                    reviewLength.put("600-700", reviewLength.get("600-700") + 1);
                } else if (wordCount <= 800) {
                    reviewLength.put("700-800", reviewLength.get("700-800") + 1);
                } else if (wordCount <= 900) {
                    reviewLength.put("800-900", reviewLength.get("800-900") + 1);
                } else if (wordCount <= 1000) {
                    reviewLength.put("900-1000", reviewLength.get("900-1000") + 1);
                } else {
                    reviewLength.put("1000+", reviewLength.get("1000+") + 1);
                }

//                SENTIMENT BY GENDER
                if (sentiment != null) {
                    String s = sentimentMapper(r.getSentiment());
                    HashMap<String , Integer> innerAgeMap = sentimentCountByAge.get(s);
                    HashMap<String, Integer> innerMap = sentimentCountByGender.get(s);
                    if (r.getReviewer().getGender() == null) {
                        innerMap.put("N/A", innerMap.get("N/A") + 1);
                    } else {
                        innerMap.put(r.getReviewer().getGender().toString(), innerMap.get(r.getReviewer().getGender().toString()) + 1);
                    }
                    if (r.getReviewer().getAge() == null || Others.getAgeGroupFromAge(Integer.valueOf(r.getReviewer().getAge())) == null || Others.getAgeGroupFromAge(Integer.valueOf(r.getReviewer().getAge())).equals("NA")) {
                        innerAgeMap.put("N/A", innerAgeMap.get("N/A") + 1);
                    } else {
                        String tmpAgeGroup = Others.getAgeGroupFromAge(Integer.valueOf(r.getReviewer().getAge()));
                        if (tmpAgeGroup.equals("NA")) {
                            innerAgeMap.put("N/A", innerAgeMap.get("N/A") + 1);
                        } else {
                            innerAgeMap.put(tmpAgeGroup, innerAgeMap.get(tmpAgeGroup) + 1);
                        }
                    }
                }
            }
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            Date generatedAt = new Date();
            String strDate = formatter.format(generatedAt);
            jsonObject.put("name", game.getName());
            jsonObject.put("id", game.getId());
            jsonObject.put("score", game.getScore());
            jsonObject.put("releaseDate", game.getReleaseDate());
            jsonObject.put("description", game.getDescription());
            jsonObject.put("iconUrl", game.getIconUrl());
            jsonObject.put("developerCompany", game.getDeveloperCompany());
            jsonObject.put("publisher", game.getPublisher());
            jsonObject.put("isInDevelopment", game.isInDevelopment());
            jsonObject.put("isDLC", game.isDLC());
            jsonObject.put("generatedAt", strDate);
            jsonObject.put("percentile", game.getPercentile());
            jsonObject.put("genderReviews", genderCount);
            jsonObject.put("ageReviews", ageCount);
            jsonObject.put("sentimentReviews", sentimentCount);
            jsonObject.put("recommendedReviews", recommendedCount);
            jsonObject.put("reviewLength", reviewLength);
            jsonObject.put("sentimentReviewsByGender", sentimentCountByGender);
            jsonObject.put("sentimentReviewsByAge", sentimentCountByAge);
            jsonObject.put("numberOfFavourites", game.getNumberOfFavourites());
            jsonObject.put("numberOfWishlists", game.getNumberOfWishlists());
            jsonObject.put("favouriteByAge", favouriteByAge);
            jsonObject.put("favouriteByGender", favouriteByGender);
            jsonObject.put("wishlistByAge", wishlistByAge);
            jsonObject.put("wishlistByGender", wishlistByGender);
            jsonObject.put("numberOfReviews", game.getNumberOfReviews());
            jsonObject.put("percentile", game.getPercentile());
            jsonObject.put("reviewedPlatform", reviewedPlatform);
            jsonObject.put("playTime", playTime);

            game.setAnalytic(jsonObject.toString());
            game.setAnalyticUpdatedAt(generatedAt);
            if (topicFreq.toString() != null && !topicFreq.isEmpty()) {
                game.setTopicFrequency(topicFreq.toString());
                game.setTopicFrequencyUpdatedAt(generatedAt);
                jsonObject.put("topicFrequency", topicFreq);
                logger.info("Topic Frequency: " + topicFreq.toString());
            }
            gameRepository.save(game);
            return new ResponseEntity<String>(jsonObject.toString(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatusCode.valueOf(400), e.getMessage());
        }


    }
}

