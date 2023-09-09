package info.itzjacky.FYP;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Game.GameRepository;
import info.itzjacky.FYP.Game.GameService;
import lombok.extern.apachecommons.CommonsLog;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;

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
		Game g = Game.builder().id(1).name("Deadline Fighter").publisher("Jacky Lee").build();
		doReturn(g).when(gameService).addGame(any());

		Assertions.assertEquals(g, gameService.addGame(g));
	}
}
