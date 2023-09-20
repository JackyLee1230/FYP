import React from 'react';
import Link from 'next/link';
import 'tailwindcss/tailwind.css';

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-9/12 flex-1 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to CritiQ, A Revolutional Game Testing and Evaluation Platform with Machine Learning for Game Developers!
        </h1>

        <div className="flex mt-6">
          <Link href="/new-game" className="m-3 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Add New Game
          </Link>

          <Link href="/new-review" className="m-3 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            Add New Review
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
