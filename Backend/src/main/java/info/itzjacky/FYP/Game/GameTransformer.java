package info.itzjacky.FYP.Game;

import org.hibernate.transform.ResultTransformer;

public class GameTransformer implements ResultTransformer {
    @Override
    public Object transformTuple(Object[] objects, String[] strings) {
// remove the properties of reviews
        Game game = new Game();
        game.setId(((Game)objects[0]).getId());
        game.setName(((Game)objects[0]).getName());
        game.setReleaseDate(((Game)objects[0]).getReleaseDate());
        game.setInDevelopment(((Game)objects[0]).isInDevelopment());
        game.setScore(((Game)objects[0]).getScore());
        game.setDLC(((Game)objects[0]).isDLC());
        game.setFree(((Game)objects[0]).isFree());
        game.setFullGame(((Game)objects[0]).isFullGame());
        game.setLegalNotice(((Game)objects[0]).getLegalNotice());
        game.setGamePage(((Game)objects[0]).getGamePage());
        game.setGamePrice(((Game)objects[0]).getGamePrice());
        game.setRequiredAge(((Game)objects[0]).getRequiredAge());
        game.setBaseGame(((Game)objects[0]).getBaseGame());
        game.setIconUrl(((Game)objects[0]).getIconUrl());
        game.setDescription(((Game)objects[0]).getDescription());
        game.setReleaseDate(((Game)objects[0]).getReleaseDate());
        game.setDeveloperCompany(((Game)objects[0]).getDeveloperCompany());
        game.setPublisher(((Game)objects[0]).getPublisher());
        game.setGenre(((Game)objects[0]).getGenre());
        game.setPlatforms(((Game)objects[0]).getPlatforms());
        game.setVersions(((Game)objects[0]).getVersions());
        game.setDevelopers(((Game)objects[0]).getDevelopers());
        game.setTester(((Game)objects[0]).getTester());

        return game;
    }
}
