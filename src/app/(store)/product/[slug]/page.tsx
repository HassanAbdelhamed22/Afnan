import React from "react";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Product: {slug}</h1>
      <p className="text-neutral-600">Detailed overview and variants for the handmade item: {slug}.</p>
    </div>
  );
}
