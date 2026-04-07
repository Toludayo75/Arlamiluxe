import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  collection: string;
  image: string;
}

export default function ProductCard({ id, name, price, collection, image }: ProductCardProps) {
  const handleClick = () => {
    console.log(`Product clicked: ${name} (ID: ${id})`);
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={handleClick}
      data-testid={`card-product-${id}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-6 space-y-3">
        <Badge variant="secondary" className="text-xs" data-testid={`badge-collection-${id}`}>
          {collection}
        </Badge>
        <h3 className="font-medium text-lg leading-tight" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <p className="text-xl font-semibold text-primary" data-testid={`text-product-price-${id}`}>
          ₦{price.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
