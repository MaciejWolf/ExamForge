import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { questionPoolsApi, type QuestionPool } from '@/services/api';
import { toast } from 'sonner';

const QuestionPoolsPage = () => {
  const [pools, setPools] = useState<QuestionPool[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPool, setCurrentPool] = useState<QuestionPool | null>(null);
  const [poolName, setPoolName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await questionPoolsApi.getAll();
      setPools(response.pools);
    } catch (error) {
      toast.error('Failed to load question pools', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!poolName.trim()) {
      toast.error('Pool name is required');
      return;
    }

    try {
      await questionPoolsApi.create({ name: poolName.trim() });
      toast.success('Pool created successfully');
      setIsCreateOpen(false);
      setPoolName('');
      fetchPools();
    } catch (error) {
      toast.error('Failed to create pool', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleEdit = async () => {
    if (!currentPool || !poolName.trim()) {
      return;
    }

    try {
      await questionPoolsApi.update(currentPool.id, { name: poolName.trim() });
      toast.success('Pool updated successfully');
      setIsEditOpen(false);
      setPoolName('');
      setCurrentPool(null);
      fetchPools();
    } catch (error) {
      toast.error('Failed to update pool', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentPool) return;

    try {
      await questionPoolsApi.delete(currentPool.id);
      toast.success('Pool deleted successfully');
      setIsDeleteOpen(false);
      setCurrentPool(null);
      fetchPools();
    } catch (error) {
      toast.error('Failed to delete pool', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openEditDialog = (pool: QuestionPool) => {
    setCurrentPool(pool);
    setPoolName(pool.name);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (pool: QuestionPool) => {
    setCurrentPool(pool);
    setIsDeleteOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question Pools List</CardTitle>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Pool
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : pools.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No question pools yet. Create your first pool to get started!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool Name</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pools.map((pool) => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.name}</TableCell>
                      <TableCell>{pool.questionCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/question-pools/${pool.id}`)}
                            title="View questions"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(pool)}
                            title="Edit pool"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(pool)}
                            title="Delete pool"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Question Pool</DialogTitle>
            <DialogDescription>Enter a name for your new question pool</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poolName">Pool Name</Label>
              <Input
                id="poolName"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="e.g., Mathematics Basic"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Pool</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pool</DialogTitle>
            <DialogDescription>Update the pool name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPoolName">Pool Name</Label>
              <Input
                id="editPoolName"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the pool &quot;{currentPool?.name}&quot;?
              <br />
              <br />
              This action cannot be undone. All questions in this pool will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default QuestionPoolsPage;

