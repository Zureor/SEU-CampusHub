import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    [key: string]: any;
}

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const snapshot = await getDocs(collection(db, 'users'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        }
    });
}
