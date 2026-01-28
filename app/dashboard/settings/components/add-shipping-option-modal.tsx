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

interface AddShippingOptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddShippingOption: (option: Omit<ShippingOption, "id">) => void;
  loading?: boolean;
}

export function AddShippingOptionModal({
  open,
  onOpenChange,
  onAddShippingOption,
  loading = false,
}: AddShippingOptionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Shipping Option</DialogTitle>
          <DialogDescription>
            Add a new shipping option to your store.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loading) return;

            const formData = new FormData(e.currentTarget);
            const option = {
              name: (formData.get("name") as string)?.trim(),
              price: Number(formData.get("price")),
              deliveryTime: (formData.get("deliveryTime") as string)?.trim(),
              status: formData.get("status") as "ACTIVE" | "CONDITIONAL",
            };

            if (
              !option.name ||
              !option.deliveryTime ||
              isNaN(option.price) ||
              option.price < 0
            ) {
              alert("Please fill in all fields correctly. Price must be non-negative.");
              return;
            }

            onAddShippingOption(option);
            e.currentTarget.reset();
            onOpenChange(false);
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="shipping-name">Name</Label>
            <Input id="shipping-name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping-price">Price (₦)</Label>
            <Input
              id="shipping-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping-delivery">Delivery Time</Label>
            <Input
              id="shipping-delivery"
              name="deliveryTime"
              placeholder="e.g. 2–5 business days"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping-status">Status</Label>
            <Select name="status" defaultValue="ACTIVE">
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
              {loading ? "Adding..." : "Add Shipping Option"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
