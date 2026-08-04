import React from "react";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Category: {slug}</h1>
      <p className="text-neutral-600">Browse handmade products in {slug}.</p>
    </div>
  );
}
