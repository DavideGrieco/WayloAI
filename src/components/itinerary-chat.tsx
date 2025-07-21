
'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import type { TripData } from '@/services/trips-service';
import { chatWithItinerary } from '@/ai/flows/chat-with-itinerary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, SendHorizonal, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ItineraryChatProps {
    trip: TripData;
}

type Message = {
    role: 'user' | 'model';
    content: string;
};

const BoldRenderer = ({ text }: { text: string }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <p>
        {parts.map((part, index) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={index}>{part.slice(2, -2)}</strong>
          ) : (
            <Fragment key={index}>{part}</Fragment>
          )
        )}
      </p>
    );
  };

export function ItineraryChat({ trip }: ItineraryChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
           const viewport = scrollArea.querySelector('div');
           if(viewport) {
             viewport.scrollTop = viewport.scrollHeight;
           }
        }
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chatWithItinerary({
                itineraryJson: JSON.stringify(trip.itineraryData),
                userQuery: input,
                history: messages // Pass the history before the new message
            });
            
            const aiResponse: Message = { role: 'model', content: result.response };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Error chatting with itinerary:", error);
            toast({
                title: 'Errore',
                description: 'Non è stato possibile ottenere una risposta. Riprova.',
                variant: 'destructive',
            });
            // remove the user message if AI fails
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mt-8 shadow-lg">
            <CardHeader>
                <CardTitle>Chatta con il Tuo Itinerario</CardTitle>
                <CardDescription>
                    Chiedi consigli o dettagli sul tuo viaggio. L'assistente AI risponderà basandosi su questo piano e ricorderà la conversazione.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] flex flex-col">
                     <ScrollArea className="flex-1 pr-4 -mr-4 mb-4" ref={scrollAreaRef}>
                        <div className="space-y-6">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-start gap-3 animate-in fade-in-0 duration-500",
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    {message.role === 'model' && (
                                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 text-sm",
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        )}
                                    >
                                       <BoldRenderer text={message.content} />
                                    </div>
                                    {message.role === 'user' && (
                                         <Avatar className="h-8 w-8 bg-accent/20 text-accent">
                                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                 <div className="flex items-start gap-3 justify-start animate-in fade-in-0 duration-500">
                                     <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-xl px-4 py-3 text-sm flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin"/>
                                    </div>
                                 </div>
                            )}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Chiedi qualcosa sul tuo viaggio..."
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <SendHorizonal className="h-4 w-4" />
                            )}
                            <span className="sr-only">Invia</span>
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
