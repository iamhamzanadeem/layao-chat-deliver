import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, User, Phone, FileText, ArrowRight } from 'lucide-react';
import type { ErrandTaskType, ErrandDetails } from '@/types/errand';
import { ERRAND_TASK_TYPES } from '@/types/errand';

interface ErrandDetailsFormProps {
  taskType: ErrandTaskType;
  onSubmit: (details: ErrandDetails) => void;
  onBack: () => void;
}

const ErrandDetailsForm = ({ taskType, onSubmit, onBack }: ErrandDetailsFormProps) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupContactName, setPickupContactName] = useState('');
  const [pickupContactPhone, setPickupContactPhone] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const taskConfig = ERRAND_TASK_TYPES.find((t) => t.value === taskType);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required';
    }
    if (!taskDescription.trim()) {
      newErrors.taskDescription = 'Please describe what you need';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      taskType,
      taskDescription: taskDescription.trim(),
      pickupAddress: pickupAddress.trim(),
      pickupContactName: pickupContactName.trim() || undefined,
      pickupContactPhone: pickupContactPhone.trim() || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-sm border border-border max-w-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{taskConfig?.icon}</span>
        <div>
          <h3 className="font-semibold text-foreground">{taskConfig?.label}</h3>
          <p className="text-xs text-muted-foreground">Fill in the details below</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Task Description */}
        <div className="space-y-2">
          <Label htmlFor="taskDescription" className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            What do you need?
          </Label>
          <Textarea
            id="taskDescription"
            placeholder={getPlaceholder(taskType)}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="resize-none"
            rows={3}
          />
          {errors.taskDescription && (
            <p className="text-xs text-destructive">{errors.taskDescription}</p>
          )}
        </div>

        {/* Pickup Address */}
        <div className="space-y-2">
          <Label htmlFor="pickupAddress" className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Pickup Location
          </Label>
          <Input
            id="pickupAddress"
            placeholder="Enter pickup address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
          />
          {errors.pickupAddress && (
            <p className="text-xs text-destructive">{errors.pickupAddress}</p>
          )}
        </div>

        {/* Optional: Contact Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="contactName" className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              Contact Name
            </Label>
            <Input
              id="contactName"
              placeholder="Optional"
              value={pickupContactName}
              onChange={(e) => setPickupContactName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Contact Phone
            </Label>
            <Input
              id="contactPhone"
              placeholder="Optional"
              value={pickupContactPhone}
              onChange={(e) => setPickupContactPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleSubmit} className="flex-1 gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

function getPlaceholder(taskType: ErrandTaskType): string {
  switch (taskType) {
    case 'document':
      return 'e.g., Pick up my passport from XYZ office on 3rd floor';
    case 'restaurant':
      return 'e.g., Order 2 double plate pulao from Savour Foods, F-7 branch';
    case 'package':
      return 'e.g., Pick up a small box from my friend\'s house';
    case 'custom':
      return 'Describe your task in detail...';
  }
}

export default ErrandDetailsForm;
