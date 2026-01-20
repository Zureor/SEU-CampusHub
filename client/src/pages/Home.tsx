import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Calendar, Users, Award, Sparkles, ChevronDown } from 'lucide-react';
import { Loading3D } from '@/components/ui/Loading3D';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParallaxSection, Parallax3DCard } from '@/components/3d/ParallaxSection';
import { EventCard } from '@/components/events/EventCard';
import { useCategories } from '@/hooks/useCategories';

const stats = [
  { icon: Calendar, value: '150+', label: 'Events This Year' },
  { icon: Users, value: '5,000+', label: 'Active Students' },
  { icon: Award, value: '50+', label: 'Scholarships' },
  { icon: Sparkles, value: '30+', label: 'Active Clubs' },
];

import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

import { useEvents } from '@/hooks/useEvents';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading3D />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  const publishedEvents = events.filter(e => e.status === 'Published');
  const featuredEvents = publishedEvents.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle border border-primary/10 mb-8"
            >
              <span className="text-sm font-medium text-primary tracking-wide uppercase">The Campus Experience</span>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
              Connect. <span className="text-primary/80">Engage.</span> <br />
              <span className="gradient-text">Thrive.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Your central hub for university events, cultural festivals, and academic workshops.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/events">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-explore-events"
                >
                  Explore Events
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-7 text-lg rounded-full border-primary/20 hover:bg-primary/5 text-primary backdrop-blur-sm"
                  data-testid="button-join-now"
                >
                  Join Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ParallaxSection speed={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-center p-6 rounded-2xl hover:bg-secondary/30 transition-colors">
                    <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground font-medium uppercase tracking-wider text-xs">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-primary">
              Discover by Category
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {isLoadingCategories ? (
              // Category skeleton loading
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`cat-skeleton-${index}`} className="glass-subtle rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))
            ) : (
              categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/events?category=${category.name}`}>
                    <div
                      className="glass-subtle rounded-2xl p-8 text-center cursor-pointer group hover:border-primary/20 transition-all duration-300 h-full flex flex-col items-center justify-center gap-4"
                      data-testid={`link-category-${category.name.toLowerCase()}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-background shadow-sm group-hover:shadow-md transition-shadow`}>
                        <div className="w-3 h-3 rounded-full bg-primary/20 group-hover:bg-accent/80 transition-colors" />
                      </div>
                      <span className="font-medium text-sm text-foreground/80 group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12"
          >
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-2">
                Featured <span className="gradient-text">Events</span>
              </h2>
              <p className="text-muted-foreground">Don't miss these exciting upcoming events</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10" data-testid="link-view-all-events">
                View All Events
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingEvents ? (
              // Featured events skeleton loading
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`event-skeleton-${index}`} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
                      <div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />


        <div className="max-w-4xl mx-auto px-4 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of students discovering amazing campus experiences.
              Sign up today and never miss an event.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0 px-8 py-6 text-lg rounded-2xl glow"
                  data-testid="button-cta-signup"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg rounded-2xl glass border-primary/30 hover:bg-primary/10"
                  data-testid="button-cta-browse"
                >
                  Browse Events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
