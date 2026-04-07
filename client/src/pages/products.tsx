import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus } from "lucide-react";
import type { Product, Collection } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");

  const { data: collections, isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCollection, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCollection !== "all") {
        params.append("collectionId", selectedCollection);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      return apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "The item has been added to your shopping bag.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCollectionChange = (value: string) => {
    setSelectedCollection(value);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock > 0) {
      addToCartMutation.mutate(product);
    }
  };

  return (
    <>
      <Helmet>
        <title>Premium Nigerian Fabrics & Adire Collection | Buy Quality African Textiles Online</title>
        <meta name="description" content="Shop premium Nigerian fabrics, Adire collections, and luxury African textiles online. Authentic Ankara prints, wax fabrics, and traditional Adire eleko. Free shipping nationwide." />
        <meta name="keywords" content="buy fabrics online Nigeria, Nigerian fabric store, Adire fabric for sale, Ankara fabric Nigeria, African wax print, traditional Adire, luxury fabrics Nigeria, unisex fabrics Nigeria" />
        <link rel="canonical" href="https://arlamiluxe.com/products" />
      </Helmet>

      <div className="min-h-screen">
        <div className="bg-primary text-primary-foreground py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-5xl font-serif mb-4">Premium Nigerian Fabrics Collection</h1>
            <p className="text-lg opacity-90">
              Discover our exquisite selection of luxury fabrics and traditional Adire pieces
            </p>
          </div>
        </div>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-search-products"
                placeholder="Search fabrics, adire, patterns..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <Select value={selectedCollection} onValueChange={handleCollectionChange}>
              <SelectTrigger data-testid="select-collection-filter" className="w-full sm:w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-all-collections">All Collections</SelectItem>
                {collectionsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  collections?.map((collection) => (
                    <SelectItem
                      key={collection.id}
                      value={collection.id}
                      data-testid={`option-collection-${collection.id}`}
                    >
                      {collection.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedCollection !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" data-testid="badge-search-filter">
                  Search: {searchQuery}
                  <button
                    data-testid="button-clear-search"
                    className="ml-2"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCollection !== "all" && (
                <Badge variant="secondary" data-testid="badge-collection-filter">
                  Collection: {collections?.find(c => c.id === selectedCollection)?.title}
                  <button
                    data-testid="button-clear-collection"
                    className="ml-2"
                    onClick={() => setSelectedCollection("all")}
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                data-testid="button-clear-all-filters"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCollection("all");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card
                  data-testid={`card-product-${product.id}`}

                  className="h-full hover-elevate active-elevate-2 transition-all cursor-pointer relative group/card"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-[4/3] overflow-hidden rounded-t-md bg-muted relative">
                      {product.imageUrl ? (
                        <img
                          src={
                            // If DB stored a filename (no leading '/' or 'http'), prefix with VITE_ASSETS_BASE_URL
                            product.imageUrl && !product.imageUrl.startsWith("/") && !product.imageUrl.startsWith("http")
                              ? `${(import.meta.env.VITE_ASSETS_BASE_URL || "").replace(/\/$/, "")}/generated_images/${product.imageUrl}`
                              : product.imageUrl
                          }
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          data-testid={`img-product-${product.id}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}

                      {product.inStock > 0 && (
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-10 w-10 rounded-full shadow-lg hover-elevate active-elevate-2"
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={addToCartMutation.isPending}
                            data-testid={`button-quick-add-${product.id}`}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3
                      className="text-xl font-serif mb-2"
                      data-testid={`text-product-name-${product.id}`}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p
                        className="text-sm text-muted-foreground line-clamp-2"
                        data-testid={`text-product-description-${product.id}`}
                      >
                        {product.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex flex-wrap justify-between items-center gap-2">
                    <span
                      className="text-2xl font-serif text-primary"
                      data-testid={`text-product-price-${product.id}`}
                    >
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.inStock > 0 ? (
                      <Badge variant="secondary" data-testid={`badge-in-stock-${product.id}`}>
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" data-testid={`badge-out-of-stock-${product.id}`}>
                        Out of Stock
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4" data-testid="text-no-products">
              No products found
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              data-testid="button-reset-filters"
              onClick={() => {
                setSearchQuery("");
                setSelectedCollection("all");
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
