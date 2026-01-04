import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, MailOpen, Send, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ContactMessage } from '@/types/database';
import { format } from 'date-fns';

export default function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setResponse(message.admin_response || '');

    // Mark as read if not already
    if (!message.is_read) {
      await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', message.id);
      
      setMessages(messages.map(m => 
        m.id === message.id ? { ...m, is_read: true } : m
      ));
    }
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !response.trim()) return;

    setResponding(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_response: response,
          responded_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast.success('Response saved successfully');
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
    } finally {
      setResponding(false);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            View and respond to contact form submissions
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">Loading...</CardContent>
            </Card>
          ) : messages.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center text-muted-foreground">
                No messages yet
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`border-0 shadow-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  !message.is_read ? 'border-l-4 border-l-primary' : ''
                }`}
                onClick={() => handleOpenMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${message.is_read ? 'text-muted-foreground' : 'text-primary'}`}>
                        {message.is_read ? (
                          <MailOpen className="h-5 w-5" />
                        ) : (
                          <Mail className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${!message.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {message.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          From: {message.name} ({message.email})
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {message.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.created_at), 'MMM d, yyyy')}
                      </p>
                      {message.admin_response && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Responded
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{selectedMessage?.subject}</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-6">
                {/* Sender Info */}
                <div className="rounded-lg bg-muted p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Received</p>
                    <p className="font-medium">
                      {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Message</h4>
                  <div className="rounded-lg border border-border p-4 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Response Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    {selectedMessage.admin_response ? 'Your Response' : 'Write a Response'}
                  </h4>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here..."
                    rows={5}
                  />
                  {selectedMessage.responded_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last responded: {format(new Date(selectedMessage.responded_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                  )}
                  <Button
                    className="mt-4"
                    onClick={handleSendResponse}
                    disabled={!response.trim() || responding}
                  >
                    {responding ? (
                      'Saving...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Save Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
