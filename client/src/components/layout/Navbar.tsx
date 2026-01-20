import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sun,
  Moon,
  Menu,
  X,
  Calendar,
  Home,
  LayoutDashboard,
  Bookmark,
  User,
  LogOut,
  Settings,
  Shield,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated, isAdmin, isSuperUser, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    ...(isAuthenticated ? [] : [{ href: '/', label: 'Home', icon: Home }]),
    { href: '/events', label: 'Events', icon: Calendar },
  ];

  const authLinks = isAuthenticated ? [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/interested-events', label: 'Interested', icon: Bookmark },
  ] : [];

  const adminLinks = isAdmin ? [
    { href: '/admin', label: 'Admin', icon: Shield },
  ] : [];

  const allLinks = [...navLinks, ...authLinks, ...adminLinks];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <nav className="max-w-7xl mx-auto bg-[var(--glass-bg)] backdrop-blur-md border border-white/20 shadow-lg rounded-full px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home-logo">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src="/seu.png" alt="SEU Logo" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-display font-medium text-lg hidden sm:block">SEU CampusHub</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {isLoading ? (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-24 bg-muted/50 rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              allLinks.map(link => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer transition-all duration-300
                        ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }
                      `}
                      data-testid={`link-nav-${link.label.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{link.label}</span>
                    </motion.div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors hidden md:block"
              data-testid="button-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-accent" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </motion.button>

            {isLoading ? (
              // Auth Loading Skeleton - prevents flash of login/signup buttons
              <div className="flex items-center gap-2 p-1 sm:pr-3 rounded-full border border-border/50">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="hidden sm:block w-16 h-4 bg-muted rounded animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 p-1 sm:pr-3 rounded-full border border-border hover:bg-secondary transition-colors"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[var(--glass-bg)] backdrop-blur-md border-border mt-2 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer" data-testid="link-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer" data-testid="link-dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer" data-testid="link-admin">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {isSuperUser && (
                    <Link href="/admin/users">
                      <DropdownMenuItem className="cursor-pointer" data-testid="link-admin-users">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="hidden sm:flex rounded-full" data-testid="button-login">
                      Log in
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full" data-testid="button-register">
                      Sign up
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full md:hidden hover:bg-secondary"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-7xl mx-auto mt-2 bg-[var(--glass-bg)] backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-xl"
          >
            <div className="flex flex-col gap-2">


              {allLinks.map(link => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all
                        ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/10">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start rounded-2xl" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full justify-start rounded-2xl bg-primary text-primary-foreground" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex justify-end px-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-accent" />
                  ) : (
                    <Moon className="w-5 h-5 text-primary" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
