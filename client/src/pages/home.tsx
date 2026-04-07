import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import CollectionCard from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Collection } from "@shared/schema";
import heroImage from '../assets/generated_images/Adire_hero_background_fabric_34499d84.png';

export default function Home() {
  const { data: collections, isLoading: collectionsLoading, isError: collectionsError } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: products, isLoading: productsLoading, isError: productsError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Generate structured data for collections and products
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Arlamiluxe - Premium Nigerian Fabrics & Adire Collection",
      "description": "Shop luxury unisex fabrics and authentic Adire collections at Arlamiluxe. Premium quality Nigerian fabrics celebrating cultural elegance and timeless style.",
      "url": "https://arlamiluxe.com",
      "mainEntity": {
        "@type": "Organization",
        "name": "Arlamiluxe",
        "url": "https://arlamiluxe.com",
        "description": "Premium Nigerian fabrics and Adire collections",
        "offers": products?.slice(0, 10).map(product => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.imageUrl,
            "offers": {
              "@type": "Offer",
              "price": (product.price / 100).toFixed(2),
              "priceCurrency": "NGN",
              "availability": product.inStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          }
        }))
      }
    };
    return JSON.stringify(structuredData);
  };

  return (
    <>
      <Helmet>
        <title>Arlamiluxe - Premium Nigerian Fabrics & Adire Collection | Luxury African Textiles</title>
        <meta name="description" content="Shop luxury unisex fabrics and authentic Adire collections at Arlamiluxe. Premium quality Nigerian fabrics celebrating cultural elegance and timeless style. Free shipping nationwide." />
        <meta name="keywords" content="Nigerian fabrics, Adire fabric, luxury fabrics Nigeria, unisex fabrics, African prints, traditional Adire, premium textiles, Ankara fabric, wax print, African wax, Nigerian wax" />
        <link rel="canonical" href="https://arlamiluxe.com/" />
        <script type="application/ld+json">{generateStructuredData()}</script>
      </Helmet>

      <div>
        <Hero
          backgroundImage={heroImage}
          title="Arlamiluxe"
          subtitle="Premium Nigerian Fabrics & Adire Collections"
          ctaText="Shop Fabrics"
          ctaLink="/collections"
        />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="sr-only">Arlamiluxe - Premium Nigerian Fabrics & Adire Collection</h1>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center mb-12" data-testid="text-collections-heading">
            Our Premium Fabric Collections
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover our curated selection of authentic Adire fabrics, Ankara prints, and luxury African textiles.
            Each piece celebrates Nigerian cultural heritage with premium quality and timeless elegance.
          </p>
        {collectionsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        ) : collectionsError ? (
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
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4" data-testid="text-featured-heading">
            Featured Products
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of premium fabrics
          </p>
        </div>
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="p-0">
                  <Skeleton className="h-64 w-full rounded-t-xl" />
                </CardHeader>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load products. Please try again later.</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card
                  data-testid={`card-product-${product.id}`}
                  className="h-full hover-elevate active-elevate-2 transition-all cursor-pointer"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-product-${product.id}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available.</p>
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" variant="outline" className="px-8" data-testid="button-view-all-products">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6" data-testid="text-story-heading">
            Our Story
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Arlamiluxe is where cultural elegance meets premium quality. We celebrate the rich heritage of Nigerian textiles, particularly the authentic Adire tradition, while offering a diverse range of luxury fabrics for the modern individual.
          </p>
          <Button variant="outline" size="lg" data-testid="button-learn-more">
            Learn More About Us
          </Button>
        </div>
      </section>
    </div>
    </>
  );
}
