package info.itzjacky.FYP.Game;

import info.itzjacky.FYP.Review.Review;
import info.itzjacky.FYP.User.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface GameRepository extends JpaRepository<Game,Integer>, CustomGameRepository{

    Game findGameById(Integer id);

    @Query("SELECT g FROM Game g WHERE g.developerCompany LIKE %:developerCompany%")
    List<Game> findGamesByDeveloperCompany(String developerCompany);

    @Query("SELECT g FROM Game g WHERE g.publisher LIKE %:developerCompany% or g.description LIKE %:developerCompany% or g.name LIKE %:developerCompany% or g.developerCompany LIKE %:developerCompany% or :genre MEMBER OF g.genre or :platform MEMBER OF g.platforms")
    List<Game> findGamesByDeveloperCompanyOrNameOrPublisherOrDescriptionOrGameGenreOrAndPlatforms(@Param("developerCompany") String developerCompany, @Param("genre")GameGenre gameGenre, @Param("platform") Platform platform);


    @Query("SELECT g FROM Game g WHERE :platform MEMBER OF g.platforms")
    List<Game> findGamesByDeveloperCompanyOrNameOrPublisherOrDescriptionOrGameGenreListOrAndPlatformsList(@Param("platform")Platform platform);

//    List<Game> findGamesByNameContainingIgnoreCaseOrDeveloperCompanyContainingIgnoreCaseOr

    @Query("SELECT g FROM Game g WHERE g.developers = ?1")
    Optional<Game> findGamesByDeveloper(User developer);

    List<Game> findGamesByPlatforms(Platform platform);

//    Optional<Game> findGameByNameAndDevelopers(String name, List<User> developer);

    Optional<Game> findGameByNameAndAndDeveloperCompany(String name, String developerCompany);

    @Query("SELECT g FROM Game g WHERE g.name LIKE %:name%")
    List<Game> findGamesByName(String name);

    @Query("SELECT count(*) FROM Game g WHERE g.name LIKE %:name%")
    Long countByName(String name);

//    @Query("SELECT g FROM Game g WHERE g.name LIKE %:name%")
//    @Query(nativeQuery=true,
//            value="Select * from Game as g where g.name like %:name%",
//            countQuery="SELECT count(*) FROM Game g WHERE g.name LIKE %:name%")
//    List<Game> findGamesByNamePaged(@Param("name") String name, PageRequest limit);

    @Query(nativeQuery = true, value = "select * from game g where g.name LIKE %:name%")
    Page<Game> findGamesByNamePaged(String name, Pageable pageable);


//    write a query to get the top 10 games by number of reviews
//    @Query("SELECT g FROM Game g ORDER BY SIZE(g.gameReviews) DESC")
//    List<Game> findTop10ByCreatedAt(Pageable pageable);

}


