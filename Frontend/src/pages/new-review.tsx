import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import 'tailwindcss/tailwind.css';

const AddNewReview = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    console.debug(data);

    try {
      const response = await fetch('http://localhost:8080/api/game/addReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.debug('Review added successfully');
//      TODO: redirect to review page
//      router.push('/reviews');
      } else {
        console.debug('Failed to add review');
      }
    } catch (error) {
        console.error('Failed to add review');
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('developer')} placeholder="Developer" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('name')} placeholder="Name" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('publisher')} placeholder="Publisher" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('score')} placeholder="Score" type="number" min="0" max="100" required className="w-full p-2 border border-gray-300 rounded" />
        <input {...register('releaseDate')} type="date" required className="w-full p-2 border border-gray-300 rounded" />
        <textarea {...register('comment')} placeholder="Comment" required className="w-full p-2 border border-gray-300 rounded h-20" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit Review</button>
      </form>

      <Link href="/" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Back to Dashboard
      </Link>
    </div>
  );
};

export default AddNewReview;
