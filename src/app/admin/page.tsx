import React from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import Link from "next/link";
import { AdminPanel, AdminTable } from "@/components/admin/admin-primitives";
import { formatEGP } from "@/lib/money";
import { getAdminDashboard } from "@/modules/admin";

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();
  const cards = [
    { label: "Pending confirmation", value: dashboard.counts.pendingOrders, href: "/admin/orders?status=PENDING_CONFIRMATION" },
    { label: "Active orders", value: dashboard.counts.activeOrders, href: "/admin/orders?sort=newest" },
    { label: "Delivered orders", value: dashboard.counts.deliveredOrders, href: "/admin/orders?status=DELIVERED" },
    { label: "Open custom requests", value: dashboard.counts.openCustomRequests, href: "/admin/custom-requests" },
  ];
  return (
    <>
      <AdminPageHeader title="Overview" description="The operational view for orders, requests, and catalog work." />
      <section aria-label="Operational counts" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Link key={card.label} href={card.href} className="border border-outline-variant bg-surface p-6 transition-colors hover:bg-surface-container-low"><p className="label-caps text-on-surface-variant">{card.label}</p><p className="headline-lg mt-3">{card.value}</p><span className="mt-4 inline-block label-caps underline underline-offset-4">Open queue</span></Link>)}</section>
      <div className="mt-8 grid gap-7 xl:grid-cols-2">
        <AdminPanel title="Recent orders" description="Newest committed orders"><AdminTable caption="Recent orders" headings={["Order", "Customer", "Status", "Total"]}>{dashboard.recentOrders.map((order) => <tr key={order.orderNumber}><td className="px-4 py-3"><Link href={`/admin/orders/${order.orderNumber}`} className="underline underline-offset-4">{order.orderNumber}</Link></td><td className="px-4 py-3">{order.customerName}</td><td className="px-4 py-3">{order.status.replaceAll("_", " ")}</td><td className="px-4 py-3">{formatEGP(order.totalAmount)}</td></tr>)}</AdminTable>{!dashboard.recentOrders.length ? <p className="body-sm text-on-surface-variant">No orders yet.</p> : null}</AdminPanel>
        <AdminPanel title="Recent custom requests" description="Newest customer submissions"><AdminTable caption="Recent custom requests" headings={["Request", "Title", "Customer", "Status"]}>{dashboard.recentCustomRequests.map((request) => <tr key={request.requestNumber}><td className="px-4 py-3"><Link href={`/admin/custom-requests/${request.requestNumber}`} className="underline underline-offset-4">{request.requestNumber}</Link></td><td className="px-4 py-3">{request.title}</td><td className="px-4 py-3">{request.customerName}</td><td className="px-4 py-3">{request.status}</td></tr>)}</AdminTable>{!dashboard.recentCustomRequests.length ? <p className="body-sm text-on-surface-variant">No custom requests yet.</p> : null}</AdminPanel>
      </div>
    </>
  );
}
