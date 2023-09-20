import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'tailwindcss/tailwind.css';


const AddNewGame = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    data.platforms = data.platforms.split(',').map((item: string) => item.trim());
    data.genre = data.genre.split(',').map((item: string) => item.trim());
    data.score = 0;

    console.debug(data);
        
    try {
      const response = await fetch('http://localhost:8080/api/game/addGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.debug('Game added successfully');
  //TODO: redirect to game home page
  //      router.push('/games');
      } else {
        console.debug('Failed to add game');
      }
    } catch (error) {
      console.error('Failed to add game');
  }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Name" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('description')} placeholder="Description" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('releaseDate')} type="date" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('developerCompany')} placeholder="Developer Company" required className="w-full p-2 border border-gray-300 rounded" />
        <label className="flex items-center space-x-2">
          <input {...register('isInDevelopment')} type="checkbox" />
          <span>Is in Development?</span>
        </label>
        <input {...register('platforms')} placeholder="Platforms (comma separated)" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('publisher')} placeholder="Publisher" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('genre')} placeholder="Genre (comma separated)" required className="w-full p-2 border border-gray-300 rounded" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add Game</button>
      </form>

      <Link href="/" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default AddNewGame;
