import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    writeBatch,
    where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        }
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newCategory: Omit<Category, 'id'>) => {
            const docRef = await addDoc(collection(db, 'categories'), newCategory);
            return { id: docRef.id, ...newCategory };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data, oldName }: { id: string; data: Partial<Category>; oldName?: string }) => {
            const batch = writeBatch(db);

            // 1. Update the category document
            const categoryRef = doc(db, 'categories', id);
            batch.update(categoryRef, data);

            // 2. If name changed, update all associated events
            if (data.name && oldName && data.name !== oldName) {
                const q = query(collection(db, 'events'), where('category', '==', oldName));
                const snapshot = await getDocs(q);

                snapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { category: data.name });
                });
            }

            await batch.commit();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
        }
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const docRef = doc(db, 'categories', id);
            await deleteDoc(docRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}
