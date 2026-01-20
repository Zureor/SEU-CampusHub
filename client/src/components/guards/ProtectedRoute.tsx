import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loading3D } from '@/components/ui/Loading3D';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading3D />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading3D />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            You do not have the required permissions to access the Admin Dashboard.
          </p>

          <div>
            <a href="/dashboard" className="text-primary hover:underline">
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
