import type { NextApiRequest, NextApiResponse } from 'next';

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  description: string;
}

const mockJobs: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React/Next.js)',
    location: 'Nairobi, Kenya (Remote)',
    description:
      'Join our marketing web team to build and enhance our user-facing web applications. Strong experience with Next.js, TypeScript, and Tailwind CSS is required.',
  },
  {
    id: 'job-2',
    title: 'Backend Engineer (NestJS)',
    location: 'Nairobi, Kenya',
    description:
      'We are looking for a backend engineer to help build and scale our microservices. Experience with NestJS, microservice architecture, and AWS is a plus.',
  },
  {
    id: 'job-3',
    title: 'Mobile Engineer (Flutter)',
    location: 'Nairobi, Kenya',
    description:
      'Help us build the future of our driver and passenger mobile applications. You will be working with Flutter to create a world-class user experience.',
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<JobOpening[]>
) {
  res.status(200).json(mockJobs);
}