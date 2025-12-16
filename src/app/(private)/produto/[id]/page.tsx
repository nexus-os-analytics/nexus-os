export default async function ProductDetailsPage(params: Promise<{ id: string }>) {
  const { id } = await params;

  return <div>Product Details Page for product ID: {id}</div>;
}
