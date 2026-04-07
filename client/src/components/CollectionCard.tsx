import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

export default function CollectionCard({ title, description, image, link }: CollectionCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(link);
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={handleClick}
      data-testid={`card-collection-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-2" data-testid={`text-collection-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </h3>
          <p className="text-sm text-white/90 mb-4" data-testid={`text-collection-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {description}
          </p>
          <div className="flex items-center text-sm font-medium">
            Explore Collection
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Card>
  );
}
