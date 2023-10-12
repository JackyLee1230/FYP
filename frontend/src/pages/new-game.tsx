import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import type { GetServerSideProps } from 'next'

type RegisterGameData = {
  name: string;
  description: string;
  releaseDate: string;
  developerCompany: string;
  isInDevelopment: boolean;
  platforms: string[];
  publisher: string;
  genre: string[];
  score: number | null;
};

type AddNewGameProps = {
  genres: string[]
  errorMessage: string
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  let genres = null;
  let errorMessage = null;

  try {
    const res = await axios.get('http://localhost:8080/api/game/getAllGameGenres');

    if(res.status === 200){
      genres = await res.data;
    }
    else{
      errorMessage = res.statusText;
    }
  } catch (error: any) {{
    console.error(error);
    errorMessage = error.toString()
  }}

  return {
    props: {
      genres,
      errorMessage,
    },
  };
};

function AddNewGame({ genres, errorMessage }: AddNewGameProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [developerCompany, setDeveloperCompany] = useState('');
  const [isInDevelopment, setIsInDevelopment] = useState(false);
  const [platforms, setPlatforms] = useState('');
  const [publisher, setPublisher] = useState('');
  const [genre, setGenre] = useState<string[]>(genres !== null ? [genres[0]] : [""]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const registerGameData: RegisterGameData = {
      name,
      description,
      releaseDate,
      developerCompany,
      isInDevelopment,
      platforms: platforms.split(',').map((item: string) => item.trim()),
      publisher,
      genre,
      score: 0
    };
    console.debug(registerGameData);
        
    try {
      const response = await axios.post('http://localhost:8080/api/game/addGame', registerGameData);

      if (response.status === 200) {
        console.debug('Game added successfully');
//      TODO: redirect to game home page
//      router.push('/games');
      } else {
        console.debug('Failed to add game');
      }
    } catch (error) {
      console.error('Failed to add game');
  }
  };

  const onGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setGenre(selectedOptions);
  };

  if(errorMessage !== null){
    return (
      <div className="text-center text-xl font-bold">{errorMessage}</div>
    )
  }

  if(genres === null){
    return (
      <div className="text-center text-xl font-bold">Loading......</div>
    )
  }

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} type="date" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={developerCompany} onChange={(e) => setDeveloperCompany(e.target.value)} placeholder="Developer Company" required className="w-full p-2 border border-gray-300 rounded" />
        <label className="flex items-center space-x-2">
          <input checked={isInDevelopment} onChange={(e) => setIsInDevelopment(e.target.checked)} type="checkbox" />
          <span>Is in Development?</span>
        </label>
        <input value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Platforms (comma separated)" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher" required className="w-full p-2 border border-gray-300 rounded" />
        <div className="flex items-center space-x-2">
          <label htmlFor="genre" className="text-lg font-bold mb-2">Select your game genre(s)</label>
          <select value={genre} onChange={onGenreChange} id="genre" className="border rounded p-2" multiple>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add Game</button>
      </form>

      <Link href="/" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default AddNewGame;
