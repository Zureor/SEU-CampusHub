import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Calendar, MapPin, Users, Clock, Heart } from 'lucide-react';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInterestedEvents } from '@/contexts/InterestedEventsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';

interface EventCardProps {
  event: Event;
  index?: number;
}



export function EventCard({ event, index = 0 }: EventCardProps) {
  const { isAuthenticated } = useAuth();
  const { isInterested, toggleInterested } = useInterestedEvents();
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isEventPast = new Date(event.date) < new Date();
  const eventIsInterested = isInterested(event.id);

  const category = categories.find(c => c.name === event.category);
  const gradientColor = category?.color || 'from-gray-500 to-gray-600';

  const handleToggleInterested = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to mark events as interested.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      await toggleInterested(event.id);
      toast({
        title: eventIsInterested ? "Removed" : "Interested!",
        description: eventIsInterested
          ? `"${event.title}" removed from interested.`
          : `"${event.title}" added to interested!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update interested events.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
      data-testid={`card-event-${event.id}`}
    >
      <div className={`bg-[var(--glass-bg)] backdrop-blur-sm border border-white/10 shadow-md rounded-3xl overflow-hidden h-full flex flex-col ${isEventPast ? 'opacity-75' : ''}`}>
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={`bg-gradient-to-r ${gradientColor} text-white border-0 px-3 py-1`}>
              {event.category}
            </Badge>
            {isEventPast && (
              <Badge className="bg-gray-600 text-white border-0 px-3 py-1">
                Ended
              </Badge>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleInterested}
            className="absolute top-4 right-4 p-2 rounded-full glass-subtle backdrop-blur-md"
            data-testid={`button-interest-event-${event.id}`}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${eventIsInterested ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </motion.button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-display font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>

          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/70" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary/70" />
                <span>{event.registered} / {event.capacity} registered</span>
              </div>
            )}
          </div>

          <Link href={`/event/${event.id}`}>
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0"
              data-testid={`button-view-event-${event.id}`}
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
