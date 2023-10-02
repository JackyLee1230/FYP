import { GameInfo } from "@/type/game";
import axios from "axios";
import { set } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

export default function Search() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 1000);

  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      setIsSearching(true);
      const response = await axios.post(
        "http://localhost:8080/api/game/findGamesByName",
        { name: debouncedSearchString }
      );

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
      <div>Game Search Page</div>

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

