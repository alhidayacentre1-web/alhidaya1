import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, QrCode, ExternalLink, Upload, User, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Student, GraduationStatus } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GraduationYear {
  id: string;
  year: number;
}

export default function Students() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [graduationYears, setGraduationYears] = useState<GraduationYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>(searchParams.get('year') || 'all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    certificate_number: '',
    graduation_year: '',
    graduation_status: 'pending' as GraduationStatus,
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchGraduationYears = async () => {
    try {
      const { data, error } = await supabase
        .from('graduation_years')
        .select('id, year')
        .order('year', { ascending: false });

      if (error) throw error;
      setGraduationYears(data || []);
    } catch (error) {
      console.error('Error fetching graduation years:', error);
    }
  };

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
    fetchGraduationYears();
    fetchStudents();
  }, []);

  // Update URL when year filter changes
  useEffect(() => {
    if (yearFilter === 'all') {
      searchParams.delete('year');
    } else {
      searchParams.set('year', yearFilter);
    }
    setSearchParams(searchParams, { replace: true });
  }, [yearFilter]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (studentId: string): Promise<string | null> => {
    if (!selectedPhoto) return null;
    
    setUploadingPhoto(true);
    try {
      const fileExt = selectedPhoto.name.split('.').pop();
      const fileName = `${studentId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, selectedPhoto, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate graduation year is selected
    if (!formData.graduation_year) {
      toast.error('Please select a graduation year');
      return;
    }

    try {
      const basePayload = {
        full_name: formData.full_name,
        admission_number: formData.admission_number,
        certificate_number: formData.certificate_number || null,
        graduation_year: parseInt(formData.graduation_year),
        graduation_status: formData.graduation_status,
      };

      if (editingStudent) {
        // Check if admission number is being changed and already exists (excluding current student)
        if (formData.admission_number !== editingStudent.admission_number) {
          const { data: existingAdmission } = await supabase
            .from('students')
            .select('id')
            .eq('admission_number', formData.admission_number)
            .neq('id', editingStudent.id)
            .maybeSingle();
          
          if (existingAdmission) {
            toast.error('A student with this admission number already exists');
            return;
          }
        }

        // Upload photo if selected
        let photoUrl: string | null = null;
        if (selectedPhoto) {
          photoUrl = await uploadPhoto(editingStudent.id);
        }
        
        const { error } = await supabase
          .from('students')
          .update(photoUrl ? { ...basePayload, photo_url: photoUrl } : basePayload)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast.success('Student updated successfully');
      } else {
        // Check if admission number already exists in database (real-time check)
        const { data: existingAdmission } = await supabase
          .from('students')
          .select('id')
          .eq('admission_number', formData.admission_number)
          .maybeSingle();
        
        if (existingAdmission) {
          toast.error('A student with this admission number already exists');
          return;
        }

        // First create the student to get the ID
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert([basePayload])
          .select()
          .single();

        if (error) {
          if (error.message.includes('duplicate')) {
            toast.error('A student with this admission or certificate number already exists');
            return;
          }
          throw error;
        }
        
        // Upload photo if selected
        if (selectedPhoto && newStudent) {
          const photoUrl = await uploadPhoto(newStudent.id);
          if (photoUrl) {
            await supabase
              .from('students')
              .update({ photo_url: photoUrl })
              .eq('id', newStudent.id);
          }
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
    setSelectedPhoto(null);
    setPhotoPreview(null);
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
    setSelectedPhoto(null);
    setPhotoPreview(student.photo_url || null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    
    try {
      // Delete photo from storage if exists
      if (deletingStudent.photo_url) {
        const fileName = deletingStudent.photo_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('student-photos').remove([fileName]);
        }
      }
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', deletingStudent.id);
      
      if (error) throw error;
      
      toast.success('Student deleted successfully');
      setDeletingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
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
                  <Label htmlFor="graduation_year">Graduation Year *</Label>
                  {graduationYears.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No years available. Please create a year first in the Years section.
                    </p>
                  ) : (
                    <Select
                      value={formData.graduation_year}
                      onValueChange={(value) => setFormData({ ...formData, graduation_year: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {graduationYears.map((year) => (
                          <SelectItem key={year.id} value={year.year.toString()}>
                            {year.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                <div className="space-y-2">
                  <Label>Student Photo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={photoPreview || undefined} alt="Student photo" />
                      <AvatarFallback>
                        <User className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('photo')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={uploadingPhoto}>
                  {uploadingPhoto ? 'Uploading...' : editingStudent ? 'Update Student' : 'Add Student'}
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
                  {graduationYears.map((year) => (
                    <SelectItem key={year.id} value={year.year.toString()}>
                      {year.year}
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
                      <TableHead>Photo</TableHead>
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
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.photo_url || undefined} alt={student.full_name} />
                            <AvatarFallback>
                              <User className="h-4 w-4 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingStudent(student)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deletingStudent?.full_name}</strong>? 
                This action cannot be undone and will permanently remove the student record and their photo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
