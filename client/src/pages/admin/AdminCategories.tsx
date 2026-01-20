import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useEvents } from '@/hooks/useEvents';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';

const DEFAULT_GRADIENTS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-amber-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500'
];

export default function AdminCategories() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: events = [] } = useEvents();
  const { data: categories = [], isLoading } = useCategories();

  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const updateCategoryMutation = useUpdateCategory();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && editName.trim()) {
      try {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: { name: editName },
          oldName: editingCategory.name
        });
        toast({ title: "Category Updated", description: "Category name has been updated." });
        setEditingCategory(null);
      } catch (error) {
        toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        // Assign a random gradient
        const randomGradient = DEFAULT_GRADIENTS[Math.floor(Math.random() * DEFAULT_GRADIENTS.length)];

        await createCategoryMutation.mutateAsync({
          name: newCategoryName,
          color: randomGradient,
          icon: 'tag' // Default icon
        });

        toast({
          title: "Category Added",
          description: `"${newCategoryName}" has been created.`,
        });
        setNewCategoryName('');
        setIsDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create category.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete ${categoryName}?`)) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
        toast({
          title: "Category Deleted",
          description: `"${categoryName}" has been removed.`,
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <FloatingShapes />

        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">
                Manage <span className="gradient-text">Categories</span>
              </h1>
              <p className="text-muted-foreground">Organize events with custom categories</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0" data-testid="button-add-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle className="font-display">Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      placeholder="Enter category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-12 bg-background/50 border-border/50 rounded-xl"
                      data-testid="input-category-name"
                    />
                  </div>
                  <Button
                    onClick={handleAddCategory}
                    disabled={createCategoryMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0"
                    data-testid="button-save-category"
                  >
                    {createCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const eventCount = events.filter(e => e.category === category.name).length;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass border-0 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                            <Tag className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold">{category.name}</h3>
                            <p className="text-muted-foreground">
                              {eventCount} event{eventCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(category)}
                            data-testid={`button-edit-category-${category.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(category.id, category.name)}
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="font-display">Category Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map(category => {
                    const eventCount = events.filter(e => e.category === category.name).length;
                    const percentage = events.length > 0 ? (eventCount / events.length) * 100 : 0;

                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="text-muted-foreground">{eventCount} events</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <Button
                onClick={handleUpdateCategory}
                disabled={updateCategoryMutation.isPending}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0"
              >
                {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </section>
    </div>
  );
}
