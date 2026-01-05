import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Award, XCircle, MessageSquare, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalStudents: number;
  totalGraduates: number;
  certificatesIssued: number;
  revokedCertificates: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalGraduates: 0,
    certificatesIssued: 0,
    revokedCertificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: students, error } = await supabase
          .from('students')
          .select('graduation_status, certificate_number');

        if (error) throw error;

        const totalStudents = students?.length || 0;
        const totalGraduates = students?.filter(s => s.graduation_status === 'graduated').length || 0;
        const certificatesIssued = students?.filter(s => s.certificate_number).length || 0;
        const revokedCertificates = students?.filter(s => s.graduation_status === 'revoked').length || 0;

        setStats({
          totalStudents,
          totalGraduates,
          certificatesIssued,
          revokedCertificates,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Graduates',
      value: stats.totalGraduates,
      icon: GraduationCap,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Certificates Issued',
      value: stats.certificatesIssued,
      icon: Award,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      title: 'Revoked Certificates',
      value: stats.revokedCertificates,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the ALHIDAYA CENTRE admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/admin/students"
                className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Manage Students</span>
              </Link>
              <Link
                to="/admin/messages"
                className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">View Messages</span>
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <Settings className="h-5 w-5 text-primary" />
                <span className="font-medium">Update Settings</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
