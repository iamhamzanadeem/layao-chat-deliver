import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;

interface UseProductsOptions {
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { categoryId, search, isAvailable } = options;

  return useQuery({
    queryKey: ['admin-products', categoryId, search, isAvailable],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (isAvailable !== undefined) {
        query = query.eq('is_available', isAvailable);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Product created',
        description: 'The product has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', data.id] });
      toast({
        title: 'Product updated',
        description: 'The product has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUploadProductImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    },
    onError: (error) => {
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
