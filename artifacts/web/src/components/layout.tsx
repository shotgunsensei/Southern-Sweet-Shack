import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Facebook, Instagram, Music2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "./cart-drawer";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  const itemCount = useCart(s => s.getItemCount());
  const setIsCartOpen = useCart(s => s.setIsOpen);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium tracking-wide">
        Celebrating 10 Years of Burney's in Clinton, NC!
      </div>

      {/* Navigation */}
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm py-3" : "bg-background py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo-badge.png`} 
              alt="Burney's Sweets & More" 
              className="h-12 w-12 rounded-full shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-heading font-bold text-2xl tracking-tight text-secondary">
              Burney's
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">Menu</Link>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About Us</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Menu Toggle & Cart */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-foreground"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                  {itemCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4 md:hidden z-50">
            <Link href="/" className="text-lg font-medium p-2 hover:bg-muted rounded-lg">Menu</Link>
            <a href="#about" className="text-lg font-medium p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#contact" className="text-lg font-medium p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-secondary text-secondary-foreground pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src={`${import.meta.env.BASE_URL}images/logo-badge.png`} 
                  alt="Logo" 
                  className="h-10 w-10 rounded-full grayscale opacity-90"
                />
                <span className="font-heading font-bold text-2xl tracking-tight">Burney's</span>
              </div>
              <p className="text-secondary-foreground/80 max-w-sm">
                Baking joy into every bite for over 10 years. Handcrafted sweets, savory treats, and a whole lot of love in Clinton, NC.
              </p>
            </div>
            
            <div>
              <h3 className="font-heading font-semibold text-xl mb-6 text-accent">Visit Us</h3>
              <address className="not-italic text-secondary-foreground/80 space-y-2">
                <p>Clinton, NC</p>
                <p>burneysofetown@gmail.com</p>
              </address>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-xl mb-6 text-accent">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://facebook.com/burneysclinton" target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com/burneyssweetsandmore" target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://tiktok.com/@burneyssweetsandmore" target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-primary transition-colors">
                  <Music2 className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
            <p>&copy; {new Date().getFullYear()} Burney's Sweets & More. All rights reserved.</p>
            <Link href="/admin" className="hover:text-accent transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>

      {/* Slide-out Cart */}
      <CartDrawer />
    </div>
  );
}
