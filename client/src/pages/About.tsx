import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Globe, Code, Database, Server, Layout, Terminal, Rocket } from 'lucide-react';
import { useEffect, useRef } from 'react';

// Brand Icons as Components
const ReactIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.5">
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(30 12 12)" />
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(-30 12 12)" />
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(90 12 12)" />
        </g>
    </svg>
);

const ViteIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M12 22L21.5 4H16L12 18L8 4H2.5L12 22Z" fill="currentColor" />
        <path d="M12 15L15 4H18L12 22L6 4H9L12 15Z" fill="currentColor" fillOpacity="0.5" />
    </svg>
);

const NodeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M12 2L3.5 6.5V17.5L12 22L20.5 17.5V6.5L12 2ZM19 16.5L12 20.3L5 16.5V7.5L12 3.7L19 7.5V16.5Z" />
    </svg>
);

const TailwindIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M12.0002 9C12.0002 9 13.9998 12.0002 15.9998 12.0002C17.9998 12.0002 19.9998 10.5002 19.9998 9.0002C19.9998 7.5002 18.0001 6 15.0001 6C12.0001 6 13.5001 3.00004 15.5001 1.50004C13.5001 1.50004 10.0001 2.99996 10.0001 6C10.0001 9 12.0002 9 12.0002 9ZM7.50011 10.5C5.50011 10.5 2.00011 11.9999 2.00011 15C2.00011 18 4.00021 18 4.00021 18C4.00021 18 5.99982 21.0002 7.99982 21.0002C9.99982 21.0002 11.9998 19.5002 11.9998 18.0002C11.9998 16.5002 10.0001 15 7.00011 15C4.00011 15 5.50011 12.0001 7.50011 10.5Z" />
    </svg>
);

const AnimatedCounter = ({ value, label }: { value: number, label: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    // We create a generic MotionValue starting at 0
    // Then we use useSpring to create a spring animation value
    const initialValue = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        if (inView) {
            initialValue.set(value);
        }
    }, [inView, initialValue, value]);

    // Round the value for display
    const displayValue = useTransform(initialValue, (latest) => Math.round(latest));

    return (
        <div ref={ref} className="text-center space-y-2">
            <h3 className="text-4xl font-bold gradient-text flex items-center justify-center">
                <motion.span>{displayValue}</motion.span>+
            </h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
    );
};

export default function About() {
    const techStack = [
        { name: 'React 19', icon: <ReactIcon />, description: 'Frontend Library' },
        { name: 'Vite', icon: <ViteIcon />, description: 'Build Tool' },
        { name: 'Tailwind CSS', icon: <TailwindIcon />, description: 'Styling Framework' },
        { name: 'Framer Motion', icon: <Rocket className="w-8 h-8" />, description: 'Animations' },
        { name: 'Node.js & Express', icon: <NodeIcon />, description: 'Backend Runtime' },
        { name: 'PostgreSQL & Drizzle', icon: <Database className="w-8 h-8" />, description: 'Database & ORM' },
    ];

    const timeline = [
        { date: 'December 2025', title: 'Project Inception', description: 'The idea was conceived to bridge the gap between design and functionality.' },
        { date: 'January 2026', title: 'First Release', description: 'Official launch of SEU CampusHub with core features and premium design.' },
    ];

    const maker = {
        name: 'Md. Shoaib Rana',
        role: 'Full Stack Developer',
        batch: 'CSE 15',
        image: 'https://avatars.githubusercontent.com/u/109033285?v=4',
        links: {
            linkedin: 'https://www.linkedin.com/in/ev1shoaib/',
            github: 'https://github.com/Zureor',
            website: 'https://ev1shoaib.netlify.app/'
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 overflow-hidden relative">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
                    <FloatingShapes />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-24 mt-12"
                    >
                        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            About <span className="gradient-text">SEU CampusHub</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Built for seeing every event that's going on in Southeast University. SEU CampusHub is your companion for seamless event discovery and management.
                        </p>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        className="grid grid-cols-2 gap-8 mb-24 max-w-2xl mx-auto"
                    >
                        <AnimatedCounter value={1000} label="Active Users" />
                        <AnimatedCounter value={5000} label="Events" />
                    </motion.div>

                    {/* Timeline Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24"
                    >
                        <h2 className="text-3xl font-bold font-display mb-12 text-center">From Idea to Impact</h2>
                        <div className="relative">
                            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border/50 hidden md:block" />
                            <div className="space-y-12">
                                {timeline.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse md:text-left'}`}
                                    >
                                        <div className="flex-1 w-full">
                                            <div className="md:px-8">
                                                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                                                    {item.date}
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                                <p className="text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                        <div className="w-4 h-4 rounded-full bg-primary relative z-10 ring-4 ring-background hidden md:block" />
                                        <div className="flex-1 w-full" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    {/* Tech Stack Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-24"
                    >
                        <h2 className="text-3xl font-bold font-display mb-12 text-center">Built with Modern Tech</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {techStack.map((tech, i) => (
                                <Card key={i} className="glass border-0 hover:bg-white/5 transition-colors duration-300">
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                            {tech.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{tech.name}</h3>
                                            <p className="text-sm text-muted-foreground">{tech.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.section>

                    {/* Maker Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold font-display mb-12">Meet the Maker</h2>
                        <div className="flex justify-center">
                            <Card className="glass border-0 max-w-md w-full overflow-hidden">
                                <CardContent className="p-8 flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted mb-6 shadow-lg">
                                        <img
                                            src="/profile.jpeg"
                                            alt={maker.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${maker.name}&background=random`
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1">{maker.name}</h3>
                                    <p className="text-primary font-medium mb-1">{maker.role}</p>
                                    <Badge variant="secondary" className="mb-6">{maker.batch}</Badge>

                                    <div className="flex gap-4">
                                        <a href={maker.links.linkedin} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:text-primary hover:border-primary transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </Button>
                                        </a>
                                        <a href={maker.links.github} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:text-primary hover:border-primary transition-colors">
                                                <Github className="w-5 h-5" />
                                            </Button>
                                        </a>
                                        <a href={maker.links.website} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:text-primary hover:border-primary transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </Button>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
