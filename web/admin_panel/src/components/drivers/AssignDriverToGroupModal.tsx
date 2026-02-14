import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, User, Users, Check } from 'lucide-react';

interface AssignDriverToGroupModalProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Driver {
  id: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
  licenseNumber: string;
  isOnline: boolean;
  currentGroup?: {
    id: string;
    name: string;
  };
}

export function AssignDriverToGroupModal({
  groupId,
  groupName,
  onClose,
  onSuccess,
}: AssignDriverToGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [driversLoading, setDriversLoading] = useState(false);

  const fetchAvailableDrivers = async () => {
    try {
      setDriversLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/drivers/unassigned?${params}`);
      const data = await response.json();
      setAvailableDrivers(data.data);
    } catch (error) {
      console.error('Failed to fetch available drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDrivers();
  }, [searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      alert('Please select a driver to assign');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/driver-groups/${groupId}/assign-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId: selectedDriverId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign driver to group');
      }

      onSuccess();
      setSelectedDriverId('');
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to assign driver:', error);
      alert(error.message || 'Failed to assign driver to group');
    } finally {
      setLoading(false);
    }
  };

  const selectedDriver = availableDrivers.find(driver => driver.id === selectedDriverId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Driver to {groupName}</DialogTitle>
          <DialogDescription>
            Select a driver to assign to this group. Only unassigned drivers are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Search */}
          <div className="space-y-2">
            <Label htmlFor="driver-search">Search Drivers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="driver-search"
                placeholder="Search by name, email, or license number..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Driver Selection */}
          <div className="space-y-2">
            <Label htmlFor="driver-select">Select Driver</Label>
            <Select
              value={selectedDriverId}
              onValueChange={setSelectedDriverId}
              disabled={driversLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a driver to assign" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {driversLoading ? 'Searching...' : 'No available drivers found'}
                  </div>
                ) : (
                  availableDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{driver.user.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {driver.licenseNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {driver.user.email} • {driver.user.phone}
                            </p>
                          </div>
                        </div>
                        {driver.currentGroup && (
                          <Badge variant="secondary" className="ml-auto">
                            Currently in {driver.currentGroup.name}
                          </Badge>
                        )}
                        {driver.isOnline && (
                          <Badge variant="default" className="ml-2">
                            Online
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Driver Summary */}
          {selectedDriver && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Selected Driver:</h4>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedDriver.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    License: {selectedDriver.licenseNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact: {selectedDriver.user.email} • {selectedDriver.user.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
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
          <Button
            type="button"
            onClick={handleAssignDriver}
            disabled={loading || !selectedDriverId}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Assign to {groupName}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}