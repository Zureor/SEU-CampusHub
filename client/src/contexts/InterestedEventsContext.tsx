import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface InterestedEventsContextType {
    interestedEventIds: string[];
    isInterested: (eventId: string) => boolean;
    toggleInterested: (eventId: string) => Promise<void>;
    isLoading: boolean;
}

const InterestedEventsContext = createContext<InterestedEventsContextType | undefined>(undefined);

export function InterestedEventsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [interestedEventIds, setInterestedEventIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    // Fetch user's interested events from Firestore
    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (!user?.id) {
                setInterestedEventIds([]);
                setIsLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.id));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setInterestedEventIds(data.interestedEvents || []);
                }
            } catch (error) {
                console.error('Error fetching user preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPreferences();
    }, [user?.id]);

    const isInterested = (eventId: string) => interestedEventIds.includes(eventId);

    const toggleInterested = async (eventId: string) => {
        if (!user?.id) return;

        const userRef = doc(db, 'users', user.id);
        const eventRef = doc(db, 'events', eventId);
        const isCurrentlyInterested = isInterested(eventId);

        try {
            if (isCurrentlyInterested) {
                // Remove from interested
                await updateDoc(userRef, {
                    interestedEvents: arrayRemove(eventId)
                });

                // Decrement event interested count
                await updateDoc(eventRef, {
                    interestedCount: increment(-1)
                });

                setInterestedEventIds(prev => prev.filter(id => id !== eventId));
            } else {
                // Add to interested
                await updateDoc(userRef, {
                    interestedEvents: arrayUnion(eventId)
                });

                // Increment event interested count
                await updateDoc(eventRef, {
                    interestedCount: increment(1)
                });

                setInterestedEventIds(prev => [...prev, eventId]);
            }

            // Invalidate events query so UI updates immediately
            queryClient.invalidateQueries({ queryKey: ['events'] });
            if (eventId) {
                queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            }

        } catch (error) {
            console.error('Error toggling interested:', error);
            throw error;
        }
    };

    return (
        <InterestedEventsContext.Provider value={{
            interestedEventIds,
            isInterested,
            toggleInterested,
            isLoading
        }}>
            {children}
        </InterestedEventsContext.Provider>
    );
}

export function useInterestedEvents() {
    const context = useContext(InterestedEventsContext);
    if (!context) {
        throw new Error('useInterestedEvents must be used within an InterestedEventsProvider');
    }
    return context;
}
