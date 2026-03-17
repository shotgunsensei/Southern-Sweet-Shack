import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  useAdminListProducts, 
  useAdminListCategories,
  useAdminDeleteProduct,
  useAdminDeleteCategory,
  type Product,
  type Category
} from "@workspace/api-client-react";
import { getAdminListProductsQueryKey, getListProductsQueryKey, getAdminListCategoriesQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Edit, Trash2, Store } from "lucide-react";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { Link } from "wouter";

export default function AdminDashboard() {
  const token = useAuth(s => s.token);
  const logout = useAuth(s => s.logout);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      setLocation("/admin/login");
    }
  }, [token, setLocation]);

  const reqOptions = { request: { headers: { Authorization: `Bearer ${token}` } } };

  // Queries
  const { data: products = [], isLoading: pLoading } = useAdminListProducts(reqOptions);
  const { data: categories = [], isLoading: cLoading } = useAdminListCategories(reqOptions);

  // Mutations
  const deleteProduct = useAdminDeleteProduct(reqOptions);
  const deleteCategory = useAdminDeleteCategory(reqOptions);

  // State
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  if (!token) return null;

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        }
      });
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("Are you sure? This may break products associated with this category.")) {
      deleteCategory.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground py-4 px-6 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={`${import.meta.env.BASE_URL}images/logo-badge.png`} className="h-10 w-10 rounded-full" />
            <h1 className="font-heading font-bold text-2xl hidden sm:block">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-accent flex items-center gap-2 transition-colors">
              <Store className="h-4 w-4" /> <span className="hidden sm:inline">View Store</span>
            </Link>
            <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-card border border-border h-14 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="products" className="rounded-lg h-full px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg h-full px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Categories
            </TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground">Menu Items</h2>
                <p className="text-muted-foreground mt-1">Manage pricing, availability, and details.</p>
              </div>
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-md rounded-xl h-11"
                onClick={() => { setEditingProduct(null); setProductDialogOpen(true); }}
              >
                <Plus className="h-5 w-5 mr-2" /> Add Product
              </Button>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10">Loading products...</TableCell></TableRow>
                    ) : products.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10">No products found.</TableCell></TableRow>
                    ) : (
                      products.map(product => (
                        <TableRow key={product.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {product.imageUrl && <img src={product.imageUrl} className="h-10 w-10 rounded-md object-cover border" />}
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.categoryName}</TableCell>
                          <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            {product.available ? 
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Visible</Badge> : 
                              <Badge variant="outline" className="text-muted-foreground">Hidden</Badge>
                            }
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" className="hover:bg-muted hover:text-primary" onClick={() => { setEditingProduct(product); setProductDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground">Categories</h2>
                <p className="text-muted-foreground mt-1">Organize your menu structure.</p>
              </div>
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-md rounded-xl h-11"
                onClick={() => { setEditingCategory(null); setCategoryDialogOpen(true); }}
              >
                <Plus className="h-5 w-5 mr-2" /> Add Category
              </Button>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-10">Loading categories...</TableCell></TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-10">No categories found.</TableCell></TableRow>
                  ) : (
                    categories.sort((a,b) => a.displayOrder - b.displayOrder).map(category => (
                      <TableRow key={category.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-lg">{category.name}</TableCell>
                        <TableCell>{category.displayOrder}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" className="hover:bg-muted hover:text-primary" onClick={() => { setEditingCategory(category); setCategoryDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <ProductFormDialog 
        open={productDialogOpen} 
        onOpenChange={setProductDialogOpen} 
        product={editingProduct} 
        categories={categories}
      />
      <CategoryFormDialog 
        open={categoryDialogOpen} 
        onOpenChange={setCategoryDialogOpen} 
        category={editingCategory} 
      />
    </div>
  );
}
