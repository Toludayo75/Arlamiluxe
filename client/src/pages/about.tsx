import { Card, CardContent } from "@/components/ui/card";
import artisanImage from '@assets/generated_images/Artisan_crafting_Adire_82a669bb.png';
import adireImage from '@assets/generated_images/Adire_collection_card_image_d89cfc1f.png';

export default function About() {
  return (
    <div>
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${artisanImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" data-testid="text-about-hero-title">
            Our Story
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            Celebrating Nigerian Heritage Through Luxury Fabrics
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6" data-testid="text-heritage-heading">
              Heritage & Luxury
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Arlamiluxe was born from a deep appreciation for Nigerian textile traditions and a commitment to delivering premium quality fabrics that honor our cultural heritage.
              </p>
              <p>
                Our name embodies our mission: "Arla" representing artistry and authenticity, "mi" signifying a personal connection, and "luxe" standing for the luxury and elegance we bring to every piece.
              </p>
              <p>
                We believe that fabric is more than material—it's a canvas for storytelling, a bridge between tradition and modernity, and a celebration of individual expression.
              </p>
            </div>
          </div>
          <div className="relative h-96 lg:h-full min-h-[400px]">
            <img
              src={adireImage}
              alt="Adire fabric craftsmanship"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center mb-12" data-testid="text-adire-heading">
            The Adire Tradition
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 lg:h-full min-h-[400px] order-2 lg:order-1">
              <img
                src={artisanImage}
                alt="Artisan creating Adire fabric"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Adire is a traditional Nigerian resist-dye textile art form that has been practiced for generations. Each piece tells a unique story through intricate patterns and vibrant indigo hues.
                </p>
                <p>
                  Our Adire collection features authentic, handcrafted fabrics created by skilled artisans who have mastered this time-honored technique. Every pattern is carefully designed and meticulously executed.
                </p>
                <p>
                  By choosing Arlamiluxe's Adire collection, you're not just purchasing fabric—you're preserving a cultural legacy and supporting the artisans who keep this beautiful tradition alive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center mb-12" data-testid="text-values-heading">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card data-testid="card-value-quality">
            <CardContent className="p-8 text-center">
              <h3 className="font-serif text-xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-muted-foreground">
                We source only the finest materials and work with master craftspeople to ensure every fabric meets our exacting standards.
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-value-heritage">
            <CardContent className="p-8 text-center">
              <h3 className="font-serif text-xl font-semibold mb-4">Cultural Heritage</h3>
              <p className="text-muted-foreground">
                Our collections celebrate Nigerian textile traditions while embracing contemporary design and innovation.
              </p>
            </CardContent>
          </Card>
          <Card data-testid="card-value-elegance">
            <CardContent className="p-8 text-center">
              <h3 className="font-serif text-xl font-semibold mb-4">Timeless Elegance</h3>
              <p className="text-muted-foreground">
                Each piece is designed to transcend trends, offering lasting beauty and versatility for any occasion.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
