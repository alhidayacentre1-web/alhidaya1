import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Shield, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Student } from '@/types/database';

export default function Verify() {
  const [searchType, setSearchType] = useState<'admission' | 'certificate'>('admission');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setLoading(true);
    try {
      const column = searchType === 'admission' ? 'admission_number' : 'certificate_number';
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq(column, searchValue.trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        navigate(`/verify/${data.id}`);
      } else {
        toast.error('No certificate found with the provided details');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="gradient-primary py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-secondary/20 px-4 py-2">
              <Shield className="mr-2 h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">Secure Verification</span>
            </div>
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Certificate Verification
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Verify the authenticity of certificates issued by ALHIDAYA CENTRE
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-2xl">Search for a Certificate</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter the admission number or certificate number to verify
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={searchType === 'admission' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSearchType('admission')}
                    >
                      Admission Number
                    </Button>
                    <Button
                      type="button"
                      variant={searchType === 'certificate' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSearchType('certificate')}
                    >
                      Certificate Number
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="searchValue">
                      {searchType === 'admission' ? 'Admission Number' : 'Certificate Number'}
                    </Label>
                    <Input
                      id="searchValue"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={
                        searchType === 'admission'
                          ? 'Enter admission number (e.g., ADM-2024-001)'
                          : 'Enter certificate number (e.g., CERT-2024-001)'
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      'Searching...'
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* QR Code Info */}
            <Card className="mt-8 border-0 shadow-lg bg-muted">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Have a QR Code?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Scan the QR code on the certificate using your phone's camera. 
                      It will automatically take you to the verification page for that certificate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
