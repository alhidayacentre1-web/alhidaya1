import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HardDrive, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatBytes } from '@/lib/imageCompression';

const TOTAL_STORAGE_MB = 1024; // 1 GB free plan

export function StorageUsageCard() {
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [usedKb, setUsedKb] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('image_size_kb');
        if (error) throw error;
        const total = (data || []).reduce(
          (sum, s: any) => sum + (s.image_size_kb || 0),
          0
        );
        setUsedKb(total);
        setTotalStudents((data || []).length);
      } catch (e) {
        console.error('Storage usage error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const usedMb = usedKb / 1024;
  const percent = Math.min((usedMb / TOTAL_STORAGE_MB) * 100, 100);
  const remainingMb = Math.max(TOTAL_STORAGE_MB - usedMb, 0);
  const remainingBytes = remainingMb * 1024 * 1024;

  const isCritical = percent >= 95;
  const isWarning = percent >= 90 && percent < 95;
  const isLastMinute = remainingMb < 50;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading storage stats...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Total Students" value={totalStudents.toString()} />
              <Stat label="Used" value={formatBytes(usedKb * 1024)} />
              <Stat label="Available" value={`${TOTAL_STORAGE_MB} MB`} />
              <Stat label="Remaining" value={formatBytes(remainingBytes)} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {usedMb.toFixed(1)} MB / {TOTAL_STORAGE_MB} MB
                </span>
                <span
                  className={
                    isCritical
                      ? 'text-destructive font-semibold'
                      : isWarning
                      ? 'text-yellow-600 font-semibold'
                      : 'text-foreground font-medium'
                  }
                >
                  {percent.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={percent}
                className={
                  isCritical
                    ? '[&>div]:bg-destructive'
                    : isWarning
                    ? '[&>div]:bg-yellow-500'
                    : ''
                }
              />
            </div>

            {isLastMinute && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Storage almost exhausted</AlertTitle>
                <AlertDescription>
                  ⚠️ Less than 50MB remaining. Immediate upgrade is required to
                  continue adding students.
                </AlertDescription>
              </Alert>
            )}

            {!isLastMinute && isCritical && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Critical: Storage almost full</AlertTitle>
                <AlertDescription>
                  Storage is critically full. System may stop accepting new uploads.
                </AlertDescription>
              </Alert>
            )}

            {!isLastMinute && isWarning && (
              <Alert className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning: High storage usage</AlertTitle>
                <AlertDescription>
                  Storage usage is above 90%. Consider preparing for upgrade.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
