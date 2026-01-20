// Type definitions for the application
// These are shared across the codebase

export interface Event {
    id: string;
    title: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    description: string;
    bannerUrl: string;
    status: 'Draft' | 'Published';
    registrationLink?: string;
    organizer: string;
    capacity?: number;
    registered?: number;
    interestedCount?: number;
    registrationRequired?: boolean;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin' | 'super-user' | null;
    avatar?: string;
    studentId?: string;
}

// Static categories removed in favor of dynamic Firebase categories
