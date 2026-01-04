import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Settings() {
  const [verificationMessage, setVerificationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('*')
          .eq('setting_key', 'verification_message')
          .maybeSingle();

        if (error) throw error;
        setVerificationMessage(
          data?.setting_value ||
            'This confirms that the above student successfully graduated from ALHIDAYA CENTRE.'
        );
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('school_settings')
        .update({ setting_value: verificationMessage })
        .eq('setting_key', 'verification_message');

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage school-wide configuration</p>
        </div>

        {/* Verification Message */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif">Verification Message</CardTitle>
            <CardDescription>
              This message appears on certificate verification pages for graduated students.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-32 rounded-lg bg-muted animate-pulse" />
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="verification_message">Message Text</Label>
                  <Textarea
                    id="verification_message"
                    value={verificationMessage}
                    onChange={(e) => setVerificationMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter the verification message..."
                  />
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="rounded-lg gradient-primary p-4">
                    <p className="text-primary-foreground text-center">
                      {verificationMessage}
                    </p>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-lg bg-muted">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Certificate Verification System</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your verification system is active. Students with "Graduated" status will have 
                  their certificates verified with the message above. Students with "Revoked" 
                  status will see a warning message instead.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
