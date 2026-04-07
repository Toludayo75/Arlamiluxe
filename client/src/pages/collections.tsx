import { useQuery } from "@tanstack/react-query";
import CollectionCard from "@/components/CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection } from "@shared/schema";

export default function Collections() {
  const { data: collections, isLoading, isError } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl font-serif mb-4" data-testid="text-collections-title">Collections</h1>
          <p className="text-lg opacity-90">
            Explore our curated collections of premium fabrics
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load collections. Please try again later.</p>
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                title={collection.title}
                description={collection.description || ""}
                image={collection.imageUrl || ""}
                link={`/products?collection=${collection.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No collections available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
