import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface GraduationYear {
  id: string;
  year: number;
  created_at: string;
  student_count?: number;
}

export default function Years() {
  const [years, setYears] = useState<GraduationYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingYear, setDeletingYear] = useState<GraduationYear | null>(null);
  const [newYear, setNewYear] = useState('');
  const navigate = useNavigate();

  const fetchYears = async () => {
    try {
      // Fetch years
      const { data: yearsData, error: yearsError } = await supabase
        .from('graduation_years')
        .select('*')
        .order('year', { ascending: false });

      if (yearsError) throw yearsError;

      // Fetch student counts for each year
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('graduation_year');

      if (studentsError) throw studentsError;

      // Count students per year
      const countMap: Record<number, number> = {};
      students?.forEach((s) => {
        if (s.graduation_year) {
          countMap[s.graduation_year] = (countMap[s.graduation_year] || 0) + 1;
        }
      });

      // Merge counts with years
      const yearsWithCounts = yearsData?.map((y) => ({
        ...y,
        student_count: countMap[y.year] || 0,
      })) || [];

      setYears(yearsWithCounts);
    } catch (error) {
      console.error('Error fetching years:', error);
      toast.error('Failed to fetch years');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const yearNum = parseInt(newYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      toast.error('Please enter a valid year (1900-2100)');
      return;
    }

    try {
      // Check if year already exists
      const { data: existing } = await supabase
        .from('graduation_years')
        .select('id')
        .eq('year', yearNum)
        .maybeSingle();

      if (existing) {
        toast.error('This year already exists');
        return;
      }

      const { error } = await supabase
        .from('graduation_years')
        .insert([{ year: yearNum }]);

      if (error) throw error;

      toast.success('Year added successfully');
      setDialogOpen(false);
      setNewYear('');
      fetchYears();
    } catch (error) {
      console.error('Error adding year:', error);
      toast.error('Failed to add year');
    }
  };

  const handleDeleteYear = async () => {
    if (!deletingYear) return;

    try {
      // Check if there are students in this year
      if (deletingYear.student_count && deletingYear.student_count > 0) {
        toast.error('Cannot delete year with existing students. Please reassign or delete the students first.');
        setDeletingYear(null);
        return;
      }

      const { error } = await supabase
        .from('graduation_years')
        .delete()
        .eq('id', deletingYear.id);

      if (error) throw error;

      toast.success('Year deleted successfully');
      setDeletingYear(null);
      fetchYears();
    } catch (error) {
      console.error('Error deleting year:', error);
      toast.error('Failed to delete year');
    }
  };

  const handleViewStudents = (year: number) => {
    navigate(`/admin/students?year=${year}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Graduation Years</h1>
            <p className="text-muted-foreground">Manage graduation years and view students by year</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Year
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-serif">Add Graduation Year</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddYear} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max="2100"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Year
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Years Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : years.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-serif text-lg font-semibold mb-2">No Years Created</h3>
                  <p className="text-muted-foreground mb-4">
                    Create graduation years to organize students
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Year
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            years.map((year) => (
              <Card key={year.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-2xl">{year.year}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingYear(year)}
                      className="text-destructive hover:text-destructive"
                      title="Delete year"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Users className="h-4 w-4" />
                    <span>{year.student_count || 0} students</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewStudents(year.year)}
                  >
                    View Students
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Years Table for larger view */}
        {!loading && years.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif">All Years ({years.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {years.map((year) => (
                      <TableRow key={year.id}>
                        <TableCell className="font-serif text-lg font-semibold">
                          {year.year}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {year.student_count || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(year.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewStudents(year.year)}
                            >
                              View Students
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingYear(year)}
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
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingYear} onOpenChange={(open) => !open && setDeletingYear(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Year</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the year <strong>{deletingYear?.year}</strong>?
                {deletingYear?.student_count && deletingYear.student_count > 0 ? (
                  <span className="block mt-2 text-destructive">
                    This year has {deletingYear.student_count} students. You must reassign or delete them first.
                  </span>
                ) : (
                  ' This action cannot be undone.'
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteYear}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={!!deletingYear?.student_count && deletingYear.student_count > 0}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
