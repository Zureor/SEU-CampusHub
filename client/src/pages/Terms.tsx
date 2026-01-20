import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Terms() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <section className="relative pt-32 pb-20 flex-grow overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Terms & <span className="gradient-text">Conditions</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Welcome to SEU CampusHub. These terms outline the rules and regulations for the use of our platform.
                        </p>
                        <p className="text-sm text-primary/80 mt-4 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass border-0 overflow-hidden shadow-2xl">
                            <ScrollArea className="h-[600px] w-full rounded-md border p-0">
                                <CardContent className="p-8 md:p-12 space-y-10">
                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">1</span>
                                            Acceptance of Terms
                                        </h2>
                                        <div className="pl-2 border-l-2 border-primary/20 space-y-4">
                                            <p className="text-muted-foreground leading-relaxed">
                                                By accessing or using SEU CampusHub ("the Platform"), you agree to be legally bound by these Terms and Conditions.
                                                If you disagree with any part of the terms, you must discontinue access to the Platform immediately.
                                            </p>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">2</span>
                                            User Responsibilities
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            As a user of SEU CampusHub, you agree to:
                                        </p>
                                        <ul className="list-none space-y-3 pl-2">
                                            {[
                                                'Provide accurate and current information during account registration.',
                                                'Maintain the confidentiality of your account credentials.',
                                                'Use the platform only for lawful purposes related to academic and campus activities.',
                                                'Respect the intellectual property and privacy rights of others.'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">3</span>
                                            Event Participation
                                        </h2>
                                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                            <p className="text-muted-foreground leading-relaxed">
                                                Registration for events through SEU CampusHub confirms your intent to participate.
                                                However, the platform does not guarantee entry if an event reaches capacity or is cancelled by organizers.
                                                Users are expected to follow the code of conduct at all university events.
                                            </p>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">4</span>
                                            Intellectual Property
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            The content, features, and functionality of SEU CampusHub are owned by the development team and are protected by international copyright, trademark, and other intellectual property laws.
                                        </p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">5</span>
                                            Limitation of Liability
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            In no event shall SEU CampusHub, nor its developers, be liable for any indirect, incidental, special, consequential or punitive damages,
                                            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of the service.
                                        </p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">6</span>
                                            Contact
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            For any legal notices or queries regarding these Terms, please contact us at: <a href="mailto:ev1shoaib@gmail.com" className="text-primary hover:underline">ev1shoaib@gmail.com</a>
                                        </p>
                                    </section>
                                </CardContent>
                            </ScrollArea>
                        </Card>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
