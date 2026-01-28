"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import type { Discount } from "@/types";
import Image from "next/image";

interface DeleteDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: Discount | null;
  onDeleteDiscount: (id: string) => void; // expects an ID here
}

export function DeleteDiscountModal({
  open,
  onOpenChange,
  discount,
  onDeleteDiscount,
}: DeleteDiscountModalProps) {
  const confirmDeleteDiscount = () => {
    if (discount) {
      onDeleteDiscount(discount.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4">
            <Image
              src={"/delete.png"}
              alt={"delete"}
              width={100}
              height={100}
              className="h-40 w-40"
            />

            <DialogTitle className="flex items-center text-center text-2xl gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 " />
              Confirm Deletion
            </DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete the discount code "
            <strong>{discount?.code}</strong>"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDeleteDiscount}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
