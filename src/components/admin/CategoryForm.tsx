import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateCategory, useUpdateCategory } from '@/hooks/admin/useCategories';
import { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  icon: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const CategoryForm = ({ category, onSuccess, onCancel }: CategoryFormProps) => {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      icon: category?.icon || '',
      is_active: category?.is_active ?? true,
    },
  });

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!category) {
      form.setValue('slug', generateSlug(value));
    }
  };

  const onSubmit = async (values: FormValues) => {
    const categoryData = {
      name: values.name,
      slug: values.slug,
      is_active: values.is_active,
      description: values.description || null,
      icon: values.icon || null,
    };

    if (category) {
      await updateCategory.mutateAsync({ id: category.id, ...categoryData });
    } else {
      await createCategory.mutateAsync(categoryData);
    }
    onSuccess();
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Icon */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Emoji)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border text-2xl">
                    {field.value || '📦'}
                  </div>
                  <Input
                    placeholder="e.g., 🍎 or 🥬"
                    {...field}
                    className="flex-1"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Use an emoji to represent this category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Fresh Fruits"
                  {...field}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g., fresh-fruits" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly identifier (auto-generated from name)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this category..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Toggle off to hide this category
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
