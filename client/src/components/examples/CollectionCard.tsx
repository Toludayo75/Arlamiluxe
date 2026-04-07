import CollectionCard from '../CollectionCard';
import adireImage from '@assets/generated_images/Adire_collection_card_image_d89cfc1f.png';
import unisexImage from '@assets/generated_images/Unisex_fabrics_collection_card_2ae14287.png';

export default function CollectionCardExample() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
      <CollectionCard
        title="Adire Collection"
        description="Authentic Nigerian tie-dye fabrics celebrating cultural heritage"
        image={adireImage}
        link="/collections/adire"
      />
      <CollectionCard
        title="Unisex Fabrics"
        description="Premium quality fabrics for every style and occasion"
        image={unisexImage}
        link="/collections/unisex"
      />
    </div>
  );
}
