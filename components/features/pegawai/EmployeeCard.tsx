'use client';

import React from 'react';
import { User } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Mail, Phone, UserCircle } from 'lucide-react';

interface EmployeeCardProps {
  employee: User;
  onEdit: (employee: User) => void;
  onDelete: (employeeId: string) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  const statusVariant = employee.status === 'Aktif' ? 'success' : 'danger';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Manager':
        return 'bg-purple-100 text-purple-800';
      case 'Kasir':
        return 'bg-blue-100 text-blue-800';
      case 'Barista':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col h-full">
        {/* Header with avatar and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
                  employee.role
                )}`}
              >
                {employee.role}
              </span>
            </div>
          </div>
          <Badge variant={statusVariant}>{employee.status}</Badge>
        </div>

        {/* Contact info */}
        <div className="space-y-2 flex-grow">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{employee.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => onEdit(employee)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => onDelete(employee.id)}
            className="flex-1"
          >
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default EmployeeCard;
