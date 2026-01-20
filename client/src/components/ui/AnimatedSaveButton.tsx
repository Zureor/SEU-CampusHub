import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

interface AnimatedSaveButtonProps extends ButtonProps {
    status: ButtonStatus;
    children: React.ReactNode;
    loadingText?: string;
    successText?: string;
    errorText?: string;
}

export function AnimatedSaveButton({
    status,
    children,
    loadingText = "Saving...",
    successText = "Saved!",
    errorText = "Error",
    className,
    disabled,
    ...props
}: AnimatedSaveButtonProps) {
    return (
        <Button
            className={cn("relative overflow-hidden min-w-[140px] transition-all duration-300", className)}
            disabled={disabled || status === 'loading' || status === 'success'}
            data-status={status}
            {...props}
        >
            <AnimatePresence mode="wait" initial={false}>
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        {children}
                    </motion.div>
                )}

                {status === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{loadingText}</span>
                    </motion.div>
                )}

                {status === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                            <Check className="h-4 w-4" />
                        </motion.div>
                        <span>{successText}</span>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 text-destructive-foreground"
                    >
                        <X className="h-4 w-4" />
                        <span>{errorText}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    );
}
