import { fetchItemById } from "@/lib/data";
import { ItemDetailView } from "@/components/item/item-detail-view";

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await fetchItemById(params.id);

  if (!item) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold">Item not found</h1>
        <p className="text-muted-foreground">
          The item you are looking for does not exist.
        </p>
      </div>
    );
  }

  return <ItemDetailView item={item} />;
}
