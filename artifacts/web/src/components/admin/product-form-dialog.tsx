import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useAdminCreateProduct, 
  useAdminUpdateProduct, 
  type Product, 
  type Category 
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListProductsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().min(2, "Description required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valid price required (e.g. 10.99)"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  categoryId: z.coerce.number().min(1, "Category required"),
  available: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
}

export function ProductFormDialog({ open, onOpenChange, product, categories }: ProductFormDialogProps) {
  const token = useAuth(s => s.token);
  const queryClient = useQueryClient();
  const reqOptions = { request: { headers: { Authorization: `Bearer ${token}` } } };
  const createProduct = useAdminCreateProduct(reqOptions);
  const updateProduct = useAdminUpdateProduct(reqOptions);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { available: true, imageUrl: "" }
  });

  useEffect(() => {
    if (product && open) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl || "",
        categoryId: product.categoryId,
        available: product.available,
      });
    } else if (open) {
      reset({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        categoryId: categories.length > 0 ? categories[0].id : 0,
        available: true,
      });
    }
  }, [product, open, reset, categories]);

  const onSubmit = (data: ProductForm) => {
    const isEditing = !!product;
    const body = {
      ...data,
      imageUrl: data.imageUrl || undefined,
    };

    const mutation = isEditing 
      ? updateProduct.mutateAsync({ id: product.id, data: body })
      : createProduct.mutateAsync({ data: body });

    mutation.then(() => {
      queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      onOpenChange(false);
    });
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={3} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input {...register("price")} placeholder="0.00" />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image URL (optional)</Label>
            <Input {...register("imageUrl")} placeholder="https://..." />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label>Available</Label>
              <p className="text-xs text-muted-foreground">Show this product to customers</p>
            </div>
            <Controller
              name="available"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
