import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckoutDialog } from "./checkout-dialog";
import { useState } from "react";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getSubtotal, getTax, getTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading font-bold text-2xl flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Your Order
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="bg-muted p-6 rounded-full text-muted-foreground mb-4">
                <ShoppingBag className="h-12 w-12 opacity-50" />
              </div>
              <h3 className="font-heading font-semibold text-xl">Your cart is empty</h3>
              <p className="text-muted-foreground max-w-[250px]">Looks like you haven't added any sweet treats yet.</p>
              <Button onClick={() => setIsOpen(false)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 group">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img 
                      src={item.product.imageUrl || "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=200&h=200&fit=crop"} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-foreground leading-tight">{item.product.name}</h4>
                      <p className="font-medium whitespace-nowrap">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-muted rounded-lg border border-border">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:text-primary transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:text-primary transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 bg-muted/30 border-t border-border mt-auto">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>NC Sales Tax (6.75%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-heading font-bold text-xl text-foreground pt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 rounded-xl"
              onClick={() => setShowCheckout(true)}
            >
              Checkout Order
            </Button>
          </div>
        )}
      </div>

      <CheckoutDialog 
        open={showCheckout} 
        onOpenChange={setShowCheckout} 
        onSuccess={() => {
          setShowCheckout(false);
          setIsOpen(false);
        }}
      />
    </>
  );
}
