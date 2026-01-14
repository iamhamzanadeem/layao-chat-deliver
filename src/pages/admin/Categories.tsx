import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryForm from '@/components/admin/CategoryForm';
import { useCategories, useDeleteCategory } from '@/hooks/admin/useCategories';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Category = Tables<'categories'>;

interface CategoryNode extends Category {
  children: CategoryNode[];
}

/**
 * Builds a tree structure from flat categories list
 */
function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create nodes
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Build tree
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

interface CategoryTreeItemProps {
  category: CategoryNode;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryTreeItem = ({ category, level, onEdit, onDelete }: CategoryTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors",
          level > 0 && "ml-6 border-l-2 border-l-primary/20"
        )}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-1 rounded hover:bg-muted",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
          {category.icon || '📦'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{category.name}</h3>
            {!category.is_active && (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                {category.children.length} sub
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {category.description || category.slug}
          </p>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Categories = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const categoryTree = categories ? buildCategoryTree(categories) : [];

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingCategoryId) {
      await deleteCategory.mutateAsync(deletingCategoryId);
      setDeletingCategoryId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  // Count total categories
  const totalCategories = categories?.length || 0;
  const topLevelCount = categoryTree.length;
  const subCategoryCount = totalCategories - topLevelCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            {totalCategories} categories ({topLevelCount} main, {subCategoryCount} sub)
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Tree */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : categoryTree.length > 0 ? (
        <div className="space-y-3">
          {categoryTree.map((category) => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              level={0}
              onEdit={handleEdit}
              onDelete={setDeletingCategoryId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No categories yet. Create your first category to organize products.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategoryId} onOpenChange={() => setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This will also delete all subcategories. Products in these categories will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
