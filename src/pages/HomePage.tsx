import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { FeaturesOverview } from '../components/home/FeaturesOverview';

export const HomePage: React.FC = () => {
  return (
    <div className="relative">
      <HeroSection />
      <FeaturesOverview />
    </div>
  );
};
