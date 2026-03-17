import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, type OrderResponse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, onSuccess }: CheckoutDialogProps) {
  const { items, clearCart, getTotal } = useCart();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const [successReceipt, setSuccessReceipt] = useState<OrderResponse | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = (data: CheckoutForm) => {
    const orderBody = {
      ...data,
      items: items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      }))
    };

    createOrder.mutate(
      { data: orderBody },
      {
        onSuccess: (response) => {
          setSuccessReceipt(response);
          clearCart();
        },
        onError: () => {
          toast({
            title: "Order Failed",
            description: "There was a problem submitting your order. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleClose = (open: boolean) => {
    if (!open && successReceipt) {
      setSuccessReceipt(null);
      onSuccess();
    } else {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        {successReceipt ? (
          <div className="p-10 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-heading font-bold text-3xl mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-8">
              Thank you, {successReceipt.customerName}. Your receipt has been emailed to {successReceipt.customerEmail}.
            </p>
            <div className="w-full bg-muted/50 rounded-xl p-6 text-left mb-8 border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono font-medium">#{successReceipt.id.toString().padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold text-primary">${parseFloat(successReceipt.total).toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-4 text-xs text-muted-foreground text-center">
                We'll contact you shortly regarding pickup.
              </div>
            </div>
            <Button size="lg" className="w-full rounded-xl h-12" onClick={() => handleClose(false)}>
              Back to Store
            </Button>
          </div>
        ) : (
          <>
            <div className="px-6 py-6 bg-primary text-primary-foreground">
              <DialogTitle className="font-heading text-2xl mb-1">Complete Your Order</DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                You're ordering {items.reduce((a,b) => a+b.quantity, 0)} items for <span className="font-bold">${getTotal().toFixed(2)}</span>
              </DialogDescription>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-card">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="font-semibold text-foreground">Full Name *</Label>
                <Input 
                  id="customerName" 
                  {...register("customerName")} 
                  className={`h-12 rounded-xl bg-background border-2 ${errors.customerName ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary focus-visible:border-primary'}`}
                  placeholder="John Doe"
                />
                {errors.customerName && <p className="text-sm text-destructive font-medium">{errors.customerName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="font-semibold text-foreground">Email Address *</Label>
                <Input 
                  id="customerEmail" 
                  type="email"
                  {...register("customerEmail")} 
                  className={`h-12 rounded-xl bg-background border-2 ${errors.customerEmail ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary focus-visible:border-primary'}`}
                  placeholder="john@example.com"
                />
                {errors.customerEmail && <p className="text-sm text-destructive font-medium">{errors.customerEmail.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="font-semibold text-foreground">Phone Number</Label>
                <Input 
                  id="customerPhone" 
                  {...register("customerPhone")} 
                  className="h-12 rounded-xl bg-background border-2 focus-visible:ring-primary focus-visible:border-primary"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions" className="font-semibold text-foreground">Special Instructions</Label>
                <Textarea 
                  id="specialInstructions" 
                  {...register("specialInstructions")} 
                  className="resize-none rounded-xl bg-background border-2 focus-visible:ring-primary focus-visible:border-primary"
                  placeholder="Pickup details, allergies, custom messages..."
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={createOrder.isPending}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  {createOrder.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    `Submit Order • $${getTotal().toFixed(2)}`
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  By submitting this order, it will be emailed directly to our team.
                </p>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
