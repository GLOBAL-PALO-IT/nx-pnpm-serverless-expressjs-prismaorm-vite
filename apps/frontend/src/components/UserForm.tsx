import React, { useState } from 'react';
import { User, CreateUserInput, UpdateUserInput } from '../services/api';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Label,
} from '@nx-serverless/ui';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  loading = false,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
  });

  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; name?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      email: formData.email.trim(),
      name: formData.name.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{user ? 'Edit User' : 'Create New User'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange('email')}
              className={errors.email ? 'border-destructive' : ''}
              disabled={loading}
              required
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={loading}
              placeholder="Optional"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
