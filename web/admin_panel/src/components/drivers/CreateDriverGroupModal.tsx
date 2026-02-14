import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DriverGroup } from '@/types/admin';
import { Building2 } from 'lucide-react';

interface CreateDriverGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingGroups?: DriverGroup[];
}

interface CreateGroupForm {
  name: string;
  description: string;
  parentGroupId: string | null;
}

export function CreateDriverGroupModal({
  onClose,
  onSuccess,
  existingGroups = [],
}: CreateDriverGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGroupForm>({
    name: '',
    description: '',
    parentGroupId: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Group name is required');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/driver-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create driver group');
      }

      onSuccess();
      setFormData({ name: '', description: '', parentGroupId: null });
    } catch (error) {
      console.error('Failed to create driver group:', error);
      alert(error.message || 'Failed to create driver group');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateGroupForm,
    value: string | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filter out child groups from parent options to prevent circular hierarchy
  const availableParentGroups = existingGroups.filter(
    group => !formData.parentGroupId || group.id !== formData.parentGroupId
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Driver Group
          </DialogTitle>
          <DialogDescription>
            Create a new driver group to organize your drivers hierarchically.
            You can optionally select a parent group to create a subgroup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter group description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentGroup">Parent Group</Label>
            <Select
              value={formData.parentGroupId || ''}
              onValueChange={(value) => 
                handleInputChange('parentGroupId', value === '' ? null : value)
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent group (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Root Group)</SelectItem>
                {availableParentGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}