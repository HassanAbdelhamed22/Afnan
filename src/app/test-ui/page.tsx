"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { FormField } from "@/components/ui/form-field";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export default function TestUIPage() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <div className="min-h-screen bg-background text-on-background p-12 flex flex-col gap-16 max-w-6xl mx-auto">


      <div>
        <h1 className="display-lg mb-2">Afnan UI System</h1>
        <p className="body-lg text-on-surface opacity-70">
          Visual test deck validating our editorial tokens (sharp edges, zero shadows, tonal layers).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Buttons */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="text">Text Link Action</Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Inputs & Selects</h2>
          <div className="flex flex-col gap-4">
            <FormField label="Recipient Name" error="">
              <Input placeholder="Enter your full name" />
            </FormField>

            <FormField label="Governorate" error="This field is required">
              <Select defaultValue="">
                <option value="" disabled>Select governorate</option>
                <option value="cairo">Cairo</option>
                <option value="giza">Giza</option>
                <option value="alexandria">Alexandria</option>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Checkbox & Radio */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Checkboxes & Radios</h2>
          <div className="flex flex-col gap-4">
            <Checkbox label="I agree to cash-on-delivery terms" defaultChecked />
            <div className="flex flex-col gap-2 mt-2">
              <span className="font-sans label-caps text-xs text-on-background/60">Fulfillment Method</span>
              <div className="flex gap-4">
                <Radio label="Ready-Made" name="fulfillment" defaultChecked />
                <Radio label="Made-to-Order" name="fulfillment" />
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Badges</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="primary">New Order</Badge>
            <Badge variant="secondary">Pending</Badge>
            <Badge variant="outline">EGP 120.00</Badge>
          </div>
        </div>

        {/* Overlays */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Dialog, Drawer & Toasts</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>Open Drawer</Button>
            <Button variant="secondary" onClick={() => setIsDialogOpen(true)}>Open Dialog</Button>
            <Button variant="secondary" onClick={() => toast.show("Success notification dispatched!", "success")}>
              Show Success Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.show("Failed to update stock limits.", "error")}>
              Show Error Toast
            </Button>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Dropdown Menus</h2>
          <div>
            <Dropdown trigger={<Button variant="secondary">Dropdown Action</Button>}>
              <DropdownItem onClick={() => toast.show("Profile Selected")}>View Profile</DropdownItem>
              <DropdownItem onClick={() => toast.show("Orders Selected")}>Manage Orders</DropdownItem>
              <div className="border-t border-solid border-outline-variant/60" />
              <DropdownItem onClick={() => toast.show("Signed Out")}>Sign Out</DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Skeleton & Image Placeholders */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Skeleton & Image Fallbacks</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <ImagePlaceholder text="Premium Clay Mug" />
          </div>
        </div>

        {/* Empty State */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6 md:col-span-2">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Empty State</h2>
          <EmptyState
            title="Your Cart is Empty"
            description="You haven't added any handmade products to your cart yet. Explore our curated collections."
            action={<Button variant="primary">Shop Collection</Button>}
            icon={
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
        </div>

        {/* Pagination */}
        <div className="border border-solid border-outline-variant bg-surface p-8 flex flex-col gap-6 md:col-span-2">
          <h2 className="headline-sm border-b border-solid border-outline-variant pb-2">Pagination</h2>
          <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Drawer Overlay */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Checkout Details">
        <div className="flex flex-col gap-4 text-on-surface">
          <p className="body-md">
            Handmade custom request details and Governorate shipping rate evaluations are processed here.
          </p>
          <Button variant="primary" onClick={() => setIsDrawerOpen(false)}>Confirm & Proceed</Button>
        </div>
      </Drawer>

      {/* Dialog Overlay */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Delete Request Confirmation">
        <p className="body-md mb-6">
          Are you sure you want to delete this custom request? This action is permanent and cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => {
            setIsDialogOpen(false);
            toast.show("Request deleted successfully", "success");
          }}>Confirm Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
