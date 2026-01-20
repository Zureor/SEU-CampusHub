import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    FileSpreadsheet,
    Users,
    Search,
    Calendar,
    Mail,
    IdCard
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useEvent } from '@/hooks/useEvents';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface RegistrationWithUser {
    eventId: string;
    userId: string;
    registeredAt: string;
    userName: string;
    userEmail: string;
    studentId: string;
}

export default function EventRegistrations() {
    const { id } = useParams();
    const { registrations } = useRegistration();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: event, isLoading } = useEvent(id || '');

    if (!event && !isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-32 text-center">
                    <h1 className="font-display text-4xl font-bold mb-4">Event Not Found</h1>
                    <Link href="/admin/events">
                        <Button>Back to Events</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Get registrations for this event - registration data now stored with user info in Firestore
    const eventRegistrations = registrations
        .filter(r => r.eventId === id && r.status === 'Registered')
        .map(r => ({
            ...r,
            // These fields are stored in the registration document from RegistrationContext
            userName: (r as any).userName || 'Unknown User',
            userEmail: (r as any).userEmail || 'N/A',
            studentId: (r as any).studentId || 'N/A',
        })) as RegistrationWithUser[];

    // Filter by search
    const filteredRegistrations = eventRegistrations.filter(r =>
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Student ID', 'Email', 'Registration Date'];
        const rows = filteredRegistrations.map(r => [
            r.userName,
            r.studentId,
            r.userEmail,
            formatDate(r.registeredAt),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event?.title.replace(/[^a-z0-9]/gi, '_') || 'event'}_registrations.csv`;
        link.click();

        toast({
            title: "Export Successful",
            description: "CSV file has been downloaded.",
        });
    };

    const exportToXLSX = () => {
        // Create a simple XLSX-compatible XML format
        const headers = ['Name', 'Student ID', 'Email', 'Registration Date'];
        const rows = filteredRegistrations.map(r => [
            r.userName,
            r.studentId,
            r.userEmail,
            formatDate(r.registeredAt),
        ]);

        // Create worksheet XML
        let worksheet = '<?xml version="1.0"?>\n';
        worksheet += '<?mso-application progid="Excel.Sheet"?>\n';
        worksheet += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
        worksheet += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
        worksheet += '<Worksheet ss:Name="Registrations">\n<Table>\n';

        // Header row
        worksheet += '<Row>\n';
        headers.forEach(h => {
            worksheet += `<Cell><Data ss:Type="String">${h}</Data></Cell>\n`;
        });
        worksheet += '</Row>\n';

        // Data rows
        rows.forEach(row => {
            worksheet += '<Row>\n';
            row.forEach(cell => {
                worksheet += `<Cell><Data ss:Type="String">${cell}</Data></Cell>\n`;
            });
            worksheet += '</Row>\n';
        });

        worksheet += '</Table>\n</Worksheet>\n</Workbook>';

        const blob = new Blob([worksheet], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event?.title.replace(/[^a-z0-9]/gi, '_') || 'event'}_registrations.xls`;
        link.click();

        toast({
            title: "Export Successful",
            description: "Excel file has been downloaded.",
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="relative pt-28 pb-20 overflow-hidden flex-grow">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="max-w-6xl mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/admin/events">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Events
                            </Button>
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                                    Event <span className="gradient-text">Registrations</span>
                                </h1>
                                <p className="text-muted-foreground">{event?.title || 'Loading...'}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                    <Users className="w-4 h-4 mr-2" />
                                    {filteredRegistrations.length} Registered
                                </Badge>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={exportToCSV}>
                                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                                            Export as CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={exportToXLSX}>
                                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                                            Export as Excel (.xls)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass border-0">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <CardTitle className="font-display">Registered Students</CardTitle>
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name, email, ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-background/50"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredRegistrations.length > 0 ? (
                                    <div className="rounded-xl overflow-hidden border border-border/50">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="font-semibold">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            Name
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        <div className="flex items-center gap-2">
                                                            <IdCard className="w-4 h-4" />
                                                            Student ID
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4" />
                                                            Email
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            Registered On
                                                        </div>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRegistrations.map((registration, index) => (
                                                    <TableRow key={`${registration.userId}-${index}`} className="hover:bg-muted/30">
                                                        <TableCell className="font-medium">{registration.userName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{registration.studentId}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{registration.userEmail}</TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {formatDate(registration.registeredAt)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="font-display text-xl font-bold mb-2">No Registrations Yet</h3>
                                        <p className="text-muted-foreground">
                                            {searchQuery ? 'No matches found for your search.' : 'No students have registered for this event.'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
