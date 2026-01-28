"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShippingOption } from "@/types/index";

interface EditShippingOptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shippingOption: ShippingOption | null;
  onEditShippingOption: (option: ShippingOption) => void;
  loading?: boolean;
}

export function EditShippingOptionModal({
  open,
  onOpenChange,
  shippingOption,
  onEditShippingOption,
  loading = false,
}: EditShippingOptionModalProps) {
  if (!shippingOption) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shipping Option</DialogTitle>
          <DialogDescription>Update shipping option details.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loading) return;

            const formData = new FormData(e.currentTarget);
            const updatedOption = {
              id: shippingOption.id,
              name: (formData.get("name") as string)?.trim(),
              price: Number(formData.get("price")),
              deliveryTime: (formData.get("deliveryTime") as string)?.trim(),
              status: formData.get("status") as "ACTIVE" | "CONDITIONAL",
            };

            if (
              !updatedOption.name ||
              !updatedOption.deliveryTime ||
              isNaN(updatedOption.price) ||
              updatedOption.price < 0
            ) {
              alert("Please fill in all fields correctly. Price must be non-negative.");
              return;
            }

            onEditShippingOption(updatedOption);
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-shipping-name">Name</Label>
            <Input
              id="edit-shipping-name"
              name="name"
              defaultValue={shippingOption.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-shipping-price">Price (₦)</Label>
            <Input
              id="edit-shipping-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={shippingOption.price}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-shipping-delivery">Delivery Time</Label>
            <Input
              id="edit-shipping-delivery"
              name="deliveryTime"
              defaultValue={shippingOption.deliveryTime}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-shipping-status">Status</Label>
            <Select name="status" defaultValue={shippingOption.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CONDITIONAL">Conditional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
