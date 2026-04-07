import ProductCard from '../ProductCard';
import product1 from '@assets/generated_images/Burgundy_damask_product_de2c81ab.png';
import product2 from '@assets/generated_images/Indigo_Adire_product_ad7e2579.png';
import product3 from '@assets/generated_images/Striped_cotton_product_212d9630.png';

export default function ProductCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      <ProductCard
        id={1}
        name="Burgundy Damask Fabric"
        price={25000}
        collection="Unisex Fabrics"
        image={product1}
      />
      <ProductCard
        id={2}
        name="Indigo Adire Pattern"
        price={18000}
        collection="Adire Collection"
        image={product2}
      />
      <ProductCard
        id={3}
        name="Striped Cotton Blend"
        price={15000}
        collection="Unisex Fabrics"
        image={product3}
      />
    </div>
  );
}
