import React from "react";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return <div className="flex min-w-0 flex-1 flex-col">{children}</div>;
}
