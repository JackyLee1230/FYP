import { GameInfo, GameSearchType, allGameSearchTypes } from "@/type/game";
import { getEnumValues } from "@/utils/Other";
import axios from "axios";
import { set } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

export default function Search() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [searchType, setSearchType] = useState<GameSearchType>("NAME");
  const [isSearching, setIsSearching] = useState(false);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 1000);

  const router = useRouter();

  useEffect(() => {
    let apiUrl: string = "";
    let body = {};
    if (searchType === "NAME") {
      apiUrl = "http://localhost:8080/api/game/findGamesByName";
      body = {
        name: debouncedSearchString,
      };
    } else if (searchType === "DEVELOPER") {
      apiUrl = "http://localhost:8080/api/game/findGamesByDeveloperCompany";
      body = {
        developerCompany: debouncedSearchString,
      };
    }

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
  }, [debouncedSearchString]);

  return (
    <>
      <div>Game Search Page With {searchType.toString()}</div>
      <div className="flex flex-row gap-4 ml-8 bg-red-300">
        {allGameSearchTypes.map((searchType) => {
          return (
            <button
              className="mt-4 cursor-pointer"
              key={searchType}
              onClick={() => {
                setSearchType(searchType);
              }}
            >
              {searchType}
            </button>
          );
        })}
      </div>

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
      {games && games.length > 0 ? (
        <>
          {isSearching && <p>Searching...</p>}
          {games.map((game) => {
            return (
              <div
                className="mt-4 cursor-pointer"
                key={game.id}
                onClick={() => {
                  router.push(`/games/${game.id}`);
                }}
              >
                {game.name}
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

