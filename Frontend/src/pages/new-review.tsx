import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import axios from 'axios';

type ReviewData = {
  name: string;
  developer: string;
  publisher: string;
  score: number;
  releaseDate: string;
  comment: string;
};

const AddNewReview = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [score, setScore] = useState(0);
  const [releaseDate, setReleaseDate] = useState('');
  const [comment, setComment] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reviewData: ReviewData = {
      name,
      developer,
      publisher,
      score,
      releaseDate,
      comment
    };

    console.log(reviewData);


    //try {
    //  const response = await axios.post('http://localhost:8080/api/game/addReview', reviewData); // 
    //  if (response.status === 200) {
    //    console.debug('Review added successfully');
//  //    TODO: redirect to review page
//  //    router.push('/reviews');
    //  } else {
    //    console.debug('Failed to add review');
    //  }
    //} catch (error) {
    //    console.error('Failed to add review');
    //}
  };

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="Developer" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={score} onChange={(e) => setScore(Number(e.target.value))} placeholder="Score" type="number" min="0" max="100" required className="w-full p-2 border border-gray-300 rounded" />
        <input value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} type="date" required className="w-full p-2 border border-gray-300 rounded" />
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment" required className="w-full p-2 border border-gray-300 rounded h-20" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit Review</button>
      </form>

      <Link href="/" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Back to Dashboard
      </Link>
    </div>
  );
};

export default AddNewReview;
