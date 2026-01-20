import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useRoute } from 'wouter';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Upload,
  Eye,
  Save,
  Send
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useCategories } from '@/hooks/useCategories';
import { useCreateEvent, useUpdateEvent, useEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { AnimatedSaveButton, ButtonStatus } from '@/components/ui/AnimatedSaveButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const { data: categories = [] } = useCategories();

  const [match, params] = useRoute("/admin/events/edit/:id");
  const eventId = match ? params!.id : null;
  const { data: existingEvent, isLoading: isLoadingEvent } = useEvent(eventId || '');

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    capacity: '',
    registrationLink: '',
    organizer: '',
    isPublished: false,
    registrationRequired: true,
  });


  const [saveStatus, setSaveStatus] = useState<ButtonStatus>('idle');
  const [publishStatus, setPublishStatus] = useState<ButtonStatus>('idle');
  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title,
        category: existingEvent.category,
        date: existingEvent.date,
        time: existingEvent.time,
        venue: existingEvent.venue,
        description: existingEvent.description,
        capacity: existingEvent.capacity?.toString() || '',
        registrationLink: existingEvent.registrationLink || '',
        organizer: existingEvent.organizer || '',
        isPublished: existingEvent.status === 'Published',
        registrationRequired: existingEvent.registrationRequired ?? true,
      });
    }
  }, [existingEvent]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (publish: boolean) => {
    // Validation
    if (!formData.title || !formData.category || !formData.date || !formData.venue) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (Title, Category, Date, Venue).",
        variant: "destructive"
      });
      return;
    }

    const setStatus = publish ? setPublishStatus : setSaveStatus;
    setStatus('loading');

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        date: formData.date,
        time: formData.time || 'TBD',
        venue: formData.venue,
        description: formData.description || '',
        ...(formData.capacity ? { capacity: parseInt(formData.capacity) } : {}),
        ...(formData.registrationLink ? { registrationLink: formData.registrationLink } : {}),
        registrationRequired: formData.registrationRequired,
        status: (publish ? 'Published' : 'Draft') as 'Published' | 'Draft',
        bannerUrl: existingEvent?.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        organizer: formData.organizer || 'Admin',
        registered: existingEvent?.registered || 0
      };

      if (eventId) {
        await updateEventMutation.mutateAsync({
          id: eventId,
          data: payload
        });
        toast({
          title: "Event Updated",
          description: "Your changes have been saved successfully."
        });
      } else {
        await createEventMutation.mutateAsync(payload);
        toast({
          title: publish ? "Event Published!" : "Draft Saved",
          description: publish
            ? "Your event is now live and visible to students."
            : "Your event has been saved as a draft.",
        });
      }

      setStatus('success');

      // Delay navigation to show success animation
      setTimeout(() => {
        setLocation('/admin/events');
      }, 1500);

    } catch (error: any) {
      console.error('Error saving event:', error);
      setStatus('error');

      let errorMessage = "Failed to save event. Please try again.";

      if (error?.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore security rules.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });

      // Reset status after error so user can try again
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <FloatingShapes />

        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/admin/events">
              <Button variant="ghost" className="mb-4" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <h1 className="font-display text-4xl font-bold mb-2">
              {eventId ? 'Edit' : 'Create'} <span className="gradient-text">{eventId ? 'Event' : 'New Event'}</span>
            </h1>
            <p className="text-muted-foreground">
              {eventId ? 'Update event details' : 'Fill in the details to create a new campus event'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="h-12 bg-background/50 border-border/50 rounded-xl"
                      data-testid="input-event-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl" data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input
                      id="organizer"
                      placeholder="Enter organizer name"
                      value={formData.organizer}
                      onChange={(e) => handleChange('organizer', e.target.value)}
                      className="h-12 bg-background/50 border-border/50 rounded-xl"
                      data-testid="input-organizer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="min-h-32 bg-background/50 border-border/50 rounded-xl resize-none"
                      data-testid="input-description"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display">Date, Time & Venue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleChange('date', e.target.value)}
                          className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                          data-testid="input-date"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="time"
                          placeholder="e.g., 10:00 AM - 5:00 PM"
                          value={formData.time}
                          onChange={(e) => handleChange('time', e.target.value)}
                          className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                          data-testid="input-time"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="venue"
                        placeholder="Enter venue location"
                        value={formData.venue}
                        onChange={(e) => handleChange('venue', e.target.value)}
                        className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                        data-testid="input-venue"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display">Registration & Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity (Optional)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Max attendees"
                        value={formData.capacity}
                        onChange={(e) => handleChange('capacity', e.target.value)}
                        className="h-12 bg-background/50 border-border/50 rounded-xl"
                        data-testid="input-capacity"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationLink">Registration Link</Label>
                      <Input
                        id="registrationLink"
                        placeholder="https://..."
                        value={formData.registrationLink}
                        onChange={(e) => handleChange('registrationLink', e.target.value)}
                        className="h-12 bg-background/50 border-border/50 rounded-xl"
                        data-testid="input-registration-link"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                    <div>
                      <Label htmlFor="registrationRequired" className="font-medium">Registration Required</Label>
                      <p className="text-sm text-muted-foreground">Users need to register to attend this event</p>
                    </div>
                    <Switch
                      id="registrationRequired"
                      checked={formData.registrationRequired}
                      onCheckedChange={(checked) => handleChange('registrationRequired', checked)}
                      data-testid="switch-registration-required"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Drop your image here or click to upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="glass border-0 sticky top-28">
                <CardHeader>
                  <CardTitle className="font-display">Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {eventId && existingEvent && (
                    <div className="p-4 rounded-xl bg-muted/50 mb-4">
                      <p className="text-sm font-medium mb-2">Current Status</p>
                      <Badge className={existingEvent.status === 'Published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {existingEvent.status}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      className="w-full glass border-border/50"
                      data-testid="button-preview"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Event
                    </Button>

                    <AnimatedSaveButton
                      onClick={() => handleSubmit(false)}
                      variant="outline"
                      className="w-full glass border-border/50"
                      status={saveStatus}
                      loadingText="Saving..."
                      successText="Saved"
                      icon={<Save className="w-4 h-4 mr-2" />}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {eventId ? 'Save as Draft / Unpublish' : 'Save as Draft'}
                    </AnimatedSaveButton>

                    <AnimatedSaveButton
                      onClick={() => handleSubmit(true)}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0"
                      status={publishStatus}
                      loadingText="Publishing..."
                      successText="Published!"
                      icon={<Send className="w-4 h-4 mr-2" />}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {eventId ? 'Update & Publish' : 'Publish Event'}
                    </AnimatedSaveButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
