import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
    ArrowLeft,
    Trash2,
    Search,
    Filter,
    User,
    Calendar,
    Mail,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useRegistration } from '@/contexts/RegistrationContext';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useQueryClient } from '@tanstack/react-query';

export default function AllRegistrations() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEvent, setFilterEvent] = useState('All');
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Stores ID of registration being deleted

    const { registrations } = useRegistration();
    const { data: events = [] } = useEvents();
    const { isSuperUser } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Create a map for quick event lookup
    const eventMap = new Map(events.map(e => [e.id, e]));

    const filteredRegistrations = registrations.filter(reg => {
        const event = eventMap.get(reg.eventId);
        const eventName = event ? event.title.toLowerCase() : 'unknown event';
        const userName = (reg.userName || '').toLowerCase();
        const userEmail = (reg.userEmail || '').toLowerCase();
        const studentId = (reg.studentId || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch = userName.includes(query) ||
            userEmail.includes(query) ||
            studentId.includes(query) ||
            eventName.includes(query);

        const matchesEvent = filterEvent === 'All' || reg.eventId === filterEvent;

        return matchesSearch && matchesEvent;
    });

    const handleDelete = async (registrationId: string, eventId: string) => {
        if (!isSuperUser) {
            toast({
                title: "Permission Denied",
                description: "Only Super Users can delete registrations.",
                variant: "destructive"
            });
            return;
        }

        setIsDeleting(registrationId);

        try {
            // 1. Delete the registration document
            await deleteDoc(doc(db, 'registrations', registrationId));

            // 2. Decrement the event count (best effort)
            // Note: Admin dashboard has a 'Fix Counts' tool if this drifts, 
            // but we should try to keep it in sync here too.
            // Ideally we'd calculate the true count, but decrement is faster for UI responsiveness
            // and 'Fix Counts' is available for deep cleaning.
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                registered: increment(-1)
            });

            // 3. Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });

            toast({
                title: "Registration Deleted",
                description: "The registration has been permanently removed.",
            });
        } catch (error: any) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete registration.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="relative pt-28 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="max-w-7xl mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/admin">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="font-display text-4xl font-bold mb-2">
                                    All <span className="gradient-text">Registrations</span>
                                </h1>
                                <p className="text-muted-foreground">
                                    View and manage all student registrations across all events
                                </p>
                            </div>
                            {!isSuperUser && (
                                <Badge variant="secondary" className="pl-2 pr-4 py-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10 border-yellow-200">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Read Only (Super Admin required to delete)
                                </Badge>
                            )}
                        </div>
                    </motion.div>

                    <Card className="glass border-0 mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by student, email, ID, or event..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 h-11 bg-background/50 border-border/50 rounded-xl"
                                    />
                                </div>
                                <Select value={filterEvent} onValueChange={setFilterEvent}>
                                    <SelectTrigger className="w-full md:w-64 h-11 bg-background/50 border-border/50 rounded-xl">
                                        <SelectValue placeholder="Filter by Event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Events</SelectItem>
                                        {events.map(event => (
                                            <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-0">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Registered At</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRegistrations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No registrations found matching your criteria
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRegistrations.map((reg) => {
                                            const event = eventMap.get(reg.eventId);
                                            return (
                                                <TableRow key={reg.id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 font-medium">
                                                                <User className="w-3 h-3 text-muted-foreground" />
                                                                {reg.userName}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Mail className="w-3 h-3" />
                                                                {reg.userEmail}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {event ? (
                                                            <div className="flex items-center gap-2">
                                                                <img src={event.bannerUrl} className="w-8 h-8 rounded object-cover" alt="" />
                                                                <span className="truncate max-w-[200px]" title={event.title}>{event.title}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">Event Deleted ({reg.eventId})</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(reg.registeredAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs">
                                                                {new Date(reg.registeredAt).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {reg.studentId || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {isSuperUser && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        disabled={isDeleting === reg.id}
                                                                    >
                                                                        {isDeleting === reg.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="w-4 h-4" />
                                                                        )}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Registration?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently remove the registration for
                                                                            <span className="font-semibold"> {reg.userName} </span>
                                                                            from event
                                                                            <span className="font-semibold"> {event?.title || 'Unknown Event'}</span>.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(reg.id, reg.eventId)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
