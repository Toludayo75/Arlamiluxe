import Hero from '../Hero';
import heroImage from '../../assets/generated_images/Hero_image_2ae14287.png';

export default function HeroExample() {
  return (
    <Hero
      backgroundImage={heroImage}
      title="Arlamiluxe"
      subtitle="Where Luxury Meets Cultural Heritage"
      ctaText="Explore Collections"
      ctaLink="/collections"
    />
  );
}
