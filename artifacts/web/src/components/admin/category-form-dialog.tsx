import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useAdminCreateCategory, 
  useAdminUpdateCategory, 
  type Category 
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListCategoriesQueryKey, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "Name required"),
  displayOrder: z.coerce.number().min(0).default(0),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const token = useAuth(s => s.token);
  const queryClient = useQueryClient();
  const reqOptions = { request: { headers: { Authorization: `Bearer ${token}` } } };
  const createCategory = useAdminCreateCategory(reqOptions);
  const updateCategory = useAdminUpdateCategory(reqOptions);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { displayOrder: 0 }
  });

  useEffect(() => {
    if (category && open) {
      reset({ name: category.name, displayOrder: category.displayOrder });
    } else if (open) {
      reset({ name: "", displayOrder: 0 });
    }
  }, [category, open, reset]);

  const onSubmit = (data: CategoryForm) => {
    const mutation = category 
      ? updateCategory.mutateAsync({ id: category.id, data })
      : createCategory.mutateAsync({ data });

    mutation.then(() => {
      queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      onOpenChange(false);
    });
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input {...register("name")} placeholder="e.g. Cakes" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input type="number" {...register("displayOrder")} />
            <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
