import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowLeft,
  GraduationCap,
  Calendar,
  Hash,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Student, SchoolSetting } from '@/types/database';
import schoolLogo from '@/assets/school-logo.png';

export default function VerifyStudent() {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const [studentResult, settingsResult] = await Promise.all([
          supabase.from('students').select('*').eq('id', studentId).maybeSingle(),
          supabase.from('school_settings').select('*').eq('setting_key', 'verification_message').maybeSingle(),
        ]);

        if (studentResult.error) throw studentResult.error;
        
        setStudent(studentResult.data);
        setVerificationMessage(
          settingsResult.data?.setting_value || 
          'This confirms that the above student successfully graduated from ALHIDAYA CENTRE.'
        );
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const getStatusConfig = (status: Student['graduation_status']) => {
    switch (status) {
      case 'graduated':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          label: 'Graduated',
          description: 'This certificate is valid and verified.',
        };
      case 'revoked':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          label: 'Revoked',
          description: 'This certificate has been revoked and is no longer valid.',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          label: 'Pending',
          description: 'This student has not yet graduated.',
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          label: 'Unknown',
          description: 'Status unknown.',
        };
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container py-24 text-center">
          <div className="animate-pulse">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
            <div className="mt-6 mx-auto h-8 w-64 rounded bg-muted" />
            <div className="mt-4 mx-auto h-4 w-48 rounded bg-muted" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !student) {
    return (
      <PublicLayout>
        <div className="container py-24">
          <Card className="mx-auto max-w-lg border-destructive/30 bg-destructive/5">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Certificate Not Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                The certificate you're looking for could not be found. Please check the 
                verification link or contact the school for assistance.
              </p>
              <Link to="/verify" className="inline-block mt-6">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Another Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  const statusConfig = getStatusConfig(student.graduation_status);
  const StatusIcon = statusConfig.icon;

  return (
    <PublicLayout>
      {/* Add noindex meta tag */}
      <meta name="robots" content="noindex, nofollow" />
      
      <div className="container py-12 md:py-24">
        <div className="mx-auto max-w-2xl">
          {/* Status Banner */}
          <Card className={`border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} mb-8`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
                <span className={`text-xl font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {statusConfig.description}
              </p>
            </CardContent>
          </Card>

          {/* Certificate Details */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center border-b border-border pb-6 mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img src={schoolLogo} alt="ALHIDAYA CENTRE Logo" className="h-16 w-16 object-contain" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-primary">ALHIDAYA CENTRE</h1>
                <p className="text-sm text-muted-foreground">Certificate Verification</p>
              </div>

              {/* Student Info */}
              <div className="space-y-6">
                {/* Student Photo */}
                {student.photo_url && (
                  <div className="flex justify-center">
                    <img 
                      src={student.photo_url} 
                      alt={student.full_name}
                      className="h-32 w-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                    />
                  </div>
                )}

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-2">
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-sm">Student Name</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    {student.full_name}
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-1">
                      <Hash className="h-4 w-4" />
                      <span className="text-xs">Admission Number</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">
                      {student.admission_number}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Graduation Year</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">
                      {student.graduation_year || 'N/A'}
                    </p>
                  </div>
                </div>

                {student.certificate_number && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-1">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs">Certificate Number</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">
                      {student.certificate_number}
                    </p>
                  </div>
                )}

                {/* Verification Message */}
                {student.graduation_status === 'graduated' && (
                  <div className="rounded-lg gradient-primary p-6 text-center mt-6">
                    <p className="text-primary-foreground">
                      {verificationMessage}
                    </p>
                  </div>
                )}

                {student.graduation_status === 'revoked' && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-6 text-center mt-6">
                    <p className="text-destructive font-medium">
                      ⚠️ WARNING: This certificate has been revoked and is no longer valid. 
                      Please contact the school for more information.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link to="/verify">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Verify Another Certificate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
