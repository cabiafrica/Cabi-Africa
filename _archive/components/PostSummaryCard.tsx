import Image from 'next/image';
import Link from 'next/link';
import { BlogPostSummary } from '../../pages/api/content/[...slug]';

interface PostSummaryCardProps {
  post: BlogPostSummary;
}

export default function PostSummaryCard({ post }: PostSummaryCardProps) {
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <Link href={`/blog/${post.id}`}>
        <Image
          className="rounded-t-lg object-cover h-48 w-full"
          src={post.imageUrl}
          alt={`Image for ${post.title}`}
          width={400}
          height={225}
        />
      </Link>
      <div className="p-5">
        <Link href={`/blog/${post.id}`}>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {post.title}
          </h5>
        </Link>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {post.summary}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{new Date(post.publishedDate).toLocaleDateString()}</p>
        <Link href={`/blog/${post.id}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Read more
        </Link>
      </div>
    </div>
  );
}