import "dotenv/config"; 
import { db } from "./db";
import { collections, products, shippingRates } from "@shared/schema";

async function seed() {
  console.log("Starting database seed...");

  const adireCollection = await db
    .insert(collections)
    .values({
      title: "Adire Collection",
      description: "Authentic Nigerian tie-dye fabrics celebrating cultural heritage",
      imageUrl: "/generated_images/Adire_collection_card_image_d89cfc1f.png",
    })
    .returning();

  const unisexCollection = await db
    .insert(collections)
    .values({
      title: "Unisex Fabrics",
      description: "Premium quality fabrics for every style and occasion",
      imageUrl: "/generated_images/Unisex_fabrics_collection_card_2ae14287.png",
    })
    .returning();

  console.log("Collections created:", adireCollection.length + unisexCollection.length);

  await db.insert(shippingRates).values([
    { state: "Lagos", fee: 2500 },
    { state: "Oyo", fee: 1550 },
    { state: "Abuja", fee: 2000 },
  ]);

  await db.insert(products).values([
    {
      name: "Burgundy Damask Fabric",
      description: "Luxurious burgundy damask with intricate woven patterns. Perfect for formal wear and special occasions.",
      price: 25000,
      collectionId: unisexCollection[0].id,
      imageUrl: "/generated_images/Burgundy_damask_product_de2c81ab.png",
      inStock: 15,
    },
    {
      name: "Indigo Adire Pattern",
      description: "Traditional hand-dyed Adire fabric in rich indigo. Each piece is unique with authentic tie-dye patterns.",
      price: 18000,
      collectionId: adireCollection[0].id,
      imageUrl: "/generated_images/Indigo_Adire_product_ad7e2579.png",
      inStock: 20,
    },
    {
      name: "Striped Cotton Blend",
      description: "Breathable cotton blend with classic striped design. Versatile for both casual and smart-casual styles.",
      price: 15000,
      collectionId: unisexCollection[0].id,
      imageUrl: "/generated_images/Striped_cotton_product_212d9630.png",
      inStock: 25,
    },
    {
      name: "Premium White Linen",
      description: "High-quality white linen fabric with a natural texture. Ideal for elegant, breathable garments.",
      price: 22000,
      collectionId: unisexCollection[0].id,
      imageUrl: "/generated_images/White_linen_product_4bf3c851.png",
      inStock: 18,
    },
    {
      name: "Ankara Print Fabric",
      description: "Vibrant Ankara print with bold African patterns. Perfect for making a statement with your style.",
      price: 20000,
      collectionId: unisexCollection[0].id,
      imageUrl: "/generated_images/Ankara_print_product_71a9a5d4.png",
      inStock: 30,
    },
    {
      name: "Burgundy Velvet",
      description: "Soft, luxurious velvet in deep burgundy. Adds elegance and warmth to any design.",
      price: 28000,
      collectionId: unisexCollection[0].id,
      imageUrl: "/generated_images/Burgundy_velvet_product_0010d3f3.png",
      inStock: 12,
    },
  ]);

  console.log("Products created: 6");
  console.log("Database seed completed successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
