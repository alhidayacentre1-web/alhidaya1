import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, QrCode, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Student, GraduationStatus } from '@/types/database';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    certificate_number: '',
    graduation_year: '',
    graduation_status: 'pending' as GraduationStatus,
  });

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        full_name: formData.full_name,
        admission_number: formData.admission_number,
        certificate_number: formData.certificate_number || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        graduation_status: formData.graduation_status,
      };

      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        const { error } = await supabase.from('students').insert([payload]);

        if (error) {
          if (error.message.includes('duplicate')) {
            toast.error('A student with this admission or certificate number already exists');
            return;
          }
          throw error;
        }
        toast.success('Student added successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      admission_number: '',
      certificate_number: '',
      graduation_year: '',
      graduation_status: 'pending',
    });
    setEditingStudent(null);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      admission_number: student.admission_number,
      certificate_number: student.certificate_number || '',
      graduation_year: student.graduation_year?.toString() || '',
      graduation_status: student.graduation_status,
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status: GraduationStatus) => {
    switch (status) {
      case 'graduated':
        return <Badge className="bg-success text-success-foreground">Graduated</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.certificate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'all' || student.graduation_status === statusFilter;
    const matchesYear =
      yearFilter === 'all' || student.graduation_year?.toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const uniqueYears = [...new Set(students.map((s) => s.graduation_year).filter(Boolean))].sort(
    (a, b) => (b || 0) - (a || 0)
  );

  const getVerificationUrl = (studentId: string) => {
    return `${window.location.origin}/verify/${studentId}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage student records and certificates</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admission_number">Admission Number *</Label>
                  <Input
                    id="admission_number"
                    value={formData.admission_number}
                    onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                    placeholder="ADM-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate_number">Certificate Number</Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                    placeholder="CERT-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_status">Graduation Status</Label>
                  <Select
                    value={formData.graduation_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, graduation_status: value as GraduationStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year?.toString() || ''}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif">
              Student Records ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission #</TableHead>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.admission_number}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.certificate_number || '-'}
                        </TableCell>
                        <TableCell>{student.graduation_year || '-'}</TableCell>
                        <TableCell>{getStatusBadge(student.graduation_status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(student)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(getVerificationUrl(student.id));
                                toast.success('Verification URL copied!');
                              }}
                              title="Copy verification URL"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/verify/${student.id}`, '_blank')}
                              title="View verification page"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
