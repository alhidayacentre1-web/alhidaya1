import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="font-serif text-2xl">Forgot Password</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              ALHIDAYA CENTRE Administration
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSent(false)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@alhidayacentre.edu"
                  className={error ? 'border-destructive' : ''}
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/admin"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
