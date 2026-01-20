import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WEB3FORMS_ACCESS_KEY = '1be840ea-4aaa-41cc-bf00-70e720454ee0';

export default function Feedback() {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append('access_key', WEB3FORMS_ACCESS_KEY);
        formData.append('subject', `SEU CampusHub Feedback: ${category} (${rating}/5 stars)`);
        formData.append('from_name', 'SEU CampusHub Feedback Form');
        formData.append('rating', String(rating));
        formData.append('category', category);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Feedback Submitted!",
                    description: "Thank you for helping us improve SEU CampusHub!",
                });
                (e.target as HTMLFormElement).reset();
                setRating(0);
                setCategory('suggestion');
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit feedback. Please try again.",
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

                <div className="max-w-2xl mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="font-display text-5xl font-bold mb-4">
                            Your <span className="gradient-text">Feedback</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">Help us shape the future of SEU CampusHub</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass border-0">
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Hidden fields for Web3Forms */}
                                    <input type="hidden" name="from_name" value="SEU CampusHub Feedback" />

                                    {/* Name and Email */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name (Optional)</Label>
                                            <Input name="name" placeholder="Your Name" className="bg-background/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email (Optional)</Label>
                                            <Input name="email" type="email" placeholder="your@email.com" className="bg-background/50" />
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="space-y-4 text-center">
                                        <Label className="text-lg">How would you rate your experience?</Label>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                    <Star
                                                        className={cn(
                                                            "w-8 h-8 transition-colors",
                                                            (hoverRating || rating) >= star
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-muted-foreground"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'suggestion', label: 'Suggestion', icon: ThumbsUp },
                                            { id: 'bug', label: 'Bug Report', icon: ThumbsDown },
                                            { id: 'other', label: 'Other', icon: MessageSquare },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setCategory(type.id as any)}
                                                className={cn(
                                                    "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                    category === type.id
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border/50 hover:border-border hover:bg-secondary/50"
                                                )}
                                            >
                                                <type.icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label>Tell us more</Label>
                                        <Textarea
                                            name="message"
                                            placeholder="What do you like? What can we do better?"
                                            className="min-h-[150px] bg-background/50 resize-none"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-primary to-accent text-white border-0"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Feedback'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
