import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { HomeCarousel } from '../components/home/HomeCarousel';
import { FeaturesOverview } from '../components/home/FeaturesOverview';

export const HomePage: React.FC = () => {
  return (
    <div className="relative">
      <HeroSection />
      <HomeCarousel />
      <FeaturesOverview />
    </div>
  );
};
