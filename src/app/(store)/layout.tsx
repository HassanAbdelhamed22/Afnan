import React from "react";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Store Header/Navbar will go here */}
      <main className="flex-1 flex flex-col">{children}</main>
      {/* Store Footer will go here */}
    </div>
  );
}
