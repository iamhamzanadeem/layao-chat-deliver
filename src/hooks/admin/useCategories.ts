import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Category = Tables<'categories'>;
type CategoryInsert = TablesInsert<'categories'>;
type CategoryUpdate = TablesUpdate<'categories'>;

export const useCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCategory = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-category', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'Category created',
        description: 'The category has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-category', data.id] });
      toast({
        title: 'Category updated',
        description: 'The category has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categories: { id: string; sort_order: number }[]) => {
      const promises = categories.map(({ id, sort_order }) =>
        supabase.from('categories').update({ sort_order }).eq('id', id)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'Categories reordered',
        description: 'The category order has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error reordering categories',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
