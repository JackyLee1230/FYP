package info.itzjacky.FYP.Game;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;


@Mapper
public interface GameMapper {

    GameMapper INSTANCE = Mappers.getMapper(GameMapper.class);

    GameDto gametoGameDTO(Game game);

    Game gameDTOToGame(GameDto gameDto);


}
