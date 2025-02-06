// import React from 'react';
// import { Metadata } from 'next';

// import { config } from '@/config';
// import { GuestGuard } from '@/components/auth/guest-guard';
// import About from '@/components/landingPage/about';
// import Card from '@/components/landingPage/card';
// import Footer from '@/components/landingPage/footer';
// import HeroSection from '@/components/landingPage/heroSection';
// import Navbar from '@/components/landingPage/navbar';

// export const metadata = { title: `${config.site.name}` } satisfies Metadata;

// const HomePage = () => {
//   return (
//     <>
//       <GuestGuard>
//         <Navbar />
//         <HeroSection />
//         <About />
//         <Card />
//         <Footer />
//       </GuestGuard>
//     </>
//   );
// };

// export default HomePage;

import { redirect } from 'next/navigation';

export default function Page(): never {
  redirect('/dashboard');
}
