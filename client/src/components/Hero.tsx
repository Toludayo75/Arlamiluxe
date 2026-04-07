import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface HeroProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export default function Hero({ backgroundImage, title, subtitle, ctaText, ctaLink }: HeroProps) {
  const [, setLocation] = useLocation();
  
  const handleCtaClick = () => {
    setLocation(ctaLink);
  };

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight" data-testid="text-hero-title">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subtitle">
          {subtitle}
        </p>
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover-elevate active-elevate-2 px-8 py-6 text-lg"
          onClick={handleCtaClick}
          data-testid="button-hero-cta"
        >
          {ctaText}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}
