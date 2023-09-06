package info.itzjacky.FYP;

import info.itzjacky.FYP.Entity.Game;
import info.itzjacky.FYP.Repository.GameRepository;
import info.itzjacky.FYP.Service.GameService;
import lombok.extern.apachecommons.CommonsLog;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.junit.platform.commons.logging.Logger;
import org.junit.platform.commons.logging.LoggerFactory;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.util.Assert;
import org.junit.platform.commons.logging.Logger;

import static org.mockito.Mockito.*;

@SpringBootTest
@Slf4j
@CommonsLog
class FypApplicationTests {

	@Mock
	GameService gameService;

	@Mock
	GameRepository gameRepository;

	@Test
	void testInstallWork_HappyCase() {
		log.info("asd");
		Integer test = 1;
		Assertions.assertNotNull(test);
	}

	@Test
	void addGame_HappyCase(){
		Game g = Game.builder().id(1).developer("Jacky Lee").name("Deadline Fighter").publisher("Jacky Lee").build();
		doReturn(g).when(gameService).addGame(any());

		Assertions.assertEquals(g, gameService.addGame(g));
	}
}
