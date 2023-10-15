package backend;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class backendSimulation extends Simulation {

    // Http Configuration
    private HttpProtocolBuilder httpProtocol = http
            .baseUrl("http://localhost:8080/api")
            .acceptHeader("application/json")
            .contentTypeHeader("application/json");

    // RUNTIME PARAMETERS
    private static final int USER_COUNT = Integer.parseInt(System.getProperty("USERS", "200"));
    private static final int RAMP_DURATION = Integer.parseInt(System.getProperty("RAMP_DURATION", "1"));


    // FEEDER FOR TEST DATA
    private static FeederBuilder.FileBased<Object> jsonFeeder = jsonFile("data/gameJsonFile.json").random();

    // BEFORE BLOCK
    @Override
    public void before() {
        System.out.printf("Running test with %d users%n", USER_COUNT);
        System.out.printf("Ramping users over %d seconds%n", RAMP_DURATION);
    }

    // HTTP CALLS
    private static ChainBuilder getAllVideoGames =
            exec(http("Get all video games")
                    .get("/game/getAllGames"));

    private static ChainBuilder searchGameWithName =
            exec(http("Search game with name")
                    .post("/game/findGamesWithSearch")
                    .body(ElFileBody("bodies/newGameTemplate.json")).asJson());

    private ScenarioBuilder scn = scenario("Backend Stress Test")
            .exec(getAllVideoGames)
            .pause(2)
            .exec(searchGameWithName)
            .pause(2)
            ;

    // Load Simulation
    {
        setUp(
                scn.injectOpen(
                        nothingFor(5),
                        rampUsers(USER_COUNT).during(RAMP_DURATION)
        )).protocols(httpProtocol);
    }
}
