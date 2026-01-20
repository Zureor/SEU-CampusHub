import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const WEB3FORMS_ACCESS_KEY = '1be840ea-4aaa-41cc-bf00-70e720454ee0';

export default function Contact() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append('access_key', WEB3FORMS_ACCESS_KEY);
        formData.append('subject', `SEU CampusHub Contact: ${formData.get('subject')}`);
        formData.append('from_name', 'SEU CampusHub Contact Form');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Message Sent!",
                    description: "We'll get back to you as soon as possible.",
                });
                (e.target as HTMLFormElement).reset();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="relative pt-32 pb-20 flex-grow overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="max-w-6xl mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="font-display text-5xl font-bold mb-4">
                            Contact <span className="gradient-text">Us</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">We'd love to hear from you.</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass border-0 h-full">
                                <CardContent className="p-8 space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold font-display mb-6">Get in Touch</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Email</p>
                                                    <p className="text-muted-foreground">ev1shoaib@gmail.com</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Location</p>
                                                    <p className="text-muted-foreground">Southeast University, Dhaka</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass border-0">
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input type="hidden" name="from_name" value="SEU CampusHub Contact" />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input name="name" placeholder="Your Name" required className="bg-background/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input name="email" type="email" placeholder="your@email.com" required className="bg-background/50" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Subject</Label>
                                            <Input name="subject" placeholder="How can we help?" required className="bg-background/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Message</Label>
                                            <Textarea name="message" placeholder="Type your message here..." className="min-h-[150px] bg-background/50 resize-none" required />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-primary to-accent text-white border-0"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
