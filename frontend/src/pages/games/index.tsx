import {
  GameInfo,
  GameSearchPageProps,
  GameSearchType,
  allGameSearchTypes,
} from "@/type/game";
import { getEnumValues } from "@/utils/Other";
import axios from "axios";
import { set } from "date-fns";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

export const getServerSideProps: GetServerSideProps = async (context) => {
  let genres = null;
  let platforms = null;
  let errorMessage = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.get(
      "http://localhost:8080/api/game/getAllGameGenres"
    );

    const platformResponse = await axios.get(
      "http://localhost:8080/api/game/getAllGamePlatforms"
    );

    if (response.status === 200 && platformResponse.status === 200) {
      genres = await response.data;
      platforms = await platformResponse.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    // console.error(error);
    errorMessage = error.toString();
  }
  console.log(genres);
  return {
    props: {
      genres,
      platforms,
    },
  };
};

export default function Search({ genres, platforms }: GameSearchPageProps) {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchString, setSearchString] = useState("");

  const [searchType, setSearchType] = useState<GameSearchType>("NAME");

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const debouncedSearchString = useDebounce(searchString, 1000);

  const onSelectedGenresChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = event.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedGenres(value);
  };

  const onSelectedPlatformsChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = event.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedPlatforms(value);
  };

  const router = useRouter();

  const search = async () => {
    let apiUrl: string = "";
    let body = {};

    apiUrl =
      searchType == "NAME"
        ? "http://localhost:8080/api/game/findGamesWithSearch"
        : "http://localhost:8080/api/game/findGamesWithSearchDeveloper";
    body = {
      name: debouncedSearchString,
      developerCompany: debouncedSearchString,
      genre: selectedGenres,
      platforms: selectedPlatforms,
    };

    const fetchGames = async () => {
      setIsSearching(true);
      const response = await axios.post(apiUrl, body);

      if (response.status !== 200) {
        return;
      }
      setGames(response.data);
      setIsSearching(false);
    };
    if (debouncedSearchString !== "") {
      fetchGames();
    }
  };

  return (
    <>
      <div>Game Search Page</div>

      <div className="flex flex-row gap-x-5">
        <input
          style={{
            color: "red",
          }}
          type="text"
          value={searchString}
          onChange={(e) => {
            console.log(e.target.value);
            setSearchString(e.target.value);
          }}
        />

        <div className="w-max">
          <label>Choose search type:</label>

          <select
            name="genres"
            id="genres"
            onChange={(e) => {
              setSearchType(e.target.value as GameSearchType);
            }}
          >
            {allGameSearchTypes.map((type) => {
              return (
                <option key={type} value={type}>
                  {type}
                </option>
              );
            })}
          </select>

          <div className="w-max">
            <label>Choose genres:</label>

            <select
              name="genres"
              id="genres"
              multiple
              onChange={(e) => {
                onSelectedGenresChange(e);
              }}
            >
              {genres &&
                genres.map((genre) => {
                  return (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        <div className="w-max">
          <label>Choose platforms:</label>

          <select
            name="genres"
            id="genres"
            multiple
            onChange={(e) => {
              onSelectedPlatformsChange(e);
            }}
          >
            {platforms &&
              platforms.map((platform) => {
                return (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                );
              })}
          </select>
        </div>

        <button onClick={search} className="bg-red">
          SEARCH
        </button>
      </div>

      {games && games.length > 0 ? (
        <>
          {isSearching && <p>Searching...</p>}
          {games.map((game) => {
            return (
              <div
                className="mt-4 cursor-pointer gap-y-4 bg-red-200 rounded-md w-fit m-4"
                key={game.id}
                onClick={() => {
                  router.push(`/games/${game.id}`);
                }}
              >
                {game.name} by {game.developerCompany} [Released on{" "}
                {game.releaseDate}]
                <br />
                [Genre: {game.genre.toString()}]
                <br />
                [Platforms: {game.platforms.toString()}]
                <br />
                {game.description}
              </div>
            );
          })}
        </>
      ) : (
        <p>No Games Found</p>
      )}
    </>
  );
}

