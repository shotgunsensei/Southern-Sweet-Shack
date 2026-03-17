import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListCategories, useListProducts, type Category, type Product } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: categories = [], isLoading: catsLoading } = useListCategories();
  const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined);
  
  // Initialize with first category once loaded if no category is selected
  if (!activeCategory && categories.length > 0 && !catsLoading) {
    setActiveCategory(categories[0].id);
  }

  const { data: products = [], isLoading: prodsLoading } = useListProducts(
    activeCategory ? { categoryId: activeCategory } : undefined,
    { query: { enabled: !!activeCategory } }
  );

  const addItem = useCart(s => s.addItem);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-secondary pt-32 pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
             src={`${import.meta.env.BASE_URL}images/hero-bakery.png`} 
             alt="Burney's Bakery Display" 
             className="w-full h-full object-cover opacity-30 mix-blend-luminosity" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
           >
             <span className="inline-block py-1 px-4 rounded-full bg-accent text-accent-foreground font-bold text-sm tracking-widest uppercase mb-6 shadow-lg">
               Clinton, NC
             </span>
             <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black mb-6 tracking-tight drop-shadow-lg leading-none">
               Burney's <span className="block text-accent">Sweets & More</span>
             </h1>
             <p className="text-xl md:text-2xl font-medium text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
               Handcrafted artisan pastries, custom cakes, and savory treats baked fresh daily with love.
             </p>
             <Button 
               size="lg" 
               className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-8 rounded-full shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all"
               onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
             >
               Order Online
             </Button>
           </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Our Menu</h2>
            <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
          </div>

          {catsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Category Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                      activeCategory === cat.id 
                        ? "bg-primary text-primary-foreground shadow-md scale-105" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              {prodsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse flex flex-col bg-card rounded-2xl p-4 shadow-sm border border-border">
                      <div className="bg-muted h-48 rounded-xl mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full mb-4" />
                      <div className="h-10 bg-muted rounded mt-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  key={activeCategory} // Force re-animation on category change
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {products.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                      No products found in this category.
                    </div>
                  ) : (
                    products.filter(p => p.available).map((product) => (
                      <motion.div 
                        variants={itemVariants}
                        key={product.id} 
                        className="group flex flex-col bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300"
                      >
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <img 
                            src={product.imageUrl || "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=600&h=600&fit=crop"} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-foreground shadow-sm">
                            ${parseFloat(product.price).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-heading font-bold text-xl text-foreground mb-2 leading-tight line-clamp-1">{product.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{product.description}</p>
                          
                          <Button 
                            onClick={() => addItem(product)}
                            className="w-full bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground rounded-xl h-12 font-bold shadow-sm transition-colors group-hover:shadow-md"
                          >
                            <Plus className="mr-2 h-5 w-5" /> Add to Order
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
               {/* Friendly bakery interior stock image */}
               <img src="https://pixabay.com/get/g2945f22114f5d2982042c0a41862ea6ff604f03d6a536ba0198784ff30bb8e7e0f9701e6da55e0d4d6ed11f59a038246003eaec44ef087935da6e1d481d92608_1280.jpg" alt="Inside the bakery" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>
            
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">A Decade of Sweetness</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For 10 years, Burney's Sweets and More has been Clinton's beloved destination for handcrafted artisan pastries. What started as a small dream has blossomed into a community staple.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From our famous glazed croissants that melt in your mouth, to our stunning custom cakes that anchor your celebrations, every item is baked fresh daily using traditional methods and a whole lot of love.
              </p>
              
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Location</h4>
                    <p className="text-muted-foreground">Clinton, NC<br/>Find us in town!</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-accent/20 p-3 rounded-full text-accent shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Hours</h4>
                    <p className="text-muted-foreground">Mon - Sat: 6am - 6pm<br/>Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
