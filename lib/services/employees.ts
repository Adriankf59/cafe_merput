// Employees service for Cafe Merah Putih Management System
// Handles CRUD operations for employees with local storage persistence

import { User } from '../types';
import { mockUsers } from '../data/mockData';

const STORAGE_KEY = 'cafe_merah_putih_employees';

// Initialize employees from local storage or mock data
function initializeEmployees(): User[] {
  if (typeof window === 'undefined') return mockUsers;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const employees = JSON.parse(stored);
    return employees.map((e: User) => ({
      ...e,
      createdAt: new Date(e.createdAt),
    }));
  }
  
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
  return mockUsers;
}

// Save employees to local storage
function saveEmployees(employees: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

// Get all employees
export function getEmployees(): User[] {
  return initializeEmployees();
}

// Get employee by ID
export function getEmployeeById(id: string): User | undefined {
  const employees = initializeEmployees();
  return employees.find((e) => e.id === id);
}

// Get employee by email
export function getEmployeeByEmail(email: string): User | undefined {
  const employees = initializeEmployees();
  return employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
}

// Search employees by name (case-insensitive)
export function searchEmployees(employees: User[], query: string): User[] {
  if (!query.trim()) return employees;
  const lowerQuery = query.toLowerCase();
  return employees.filter((e) => e.name.toLowerCase().includes(lowerQuery));
}

// Generate new employee ID
function generateEmployeeId(): string {
  const employees = initializeEmployees();
  const maxId = employees.reduce((max, e) => {
    const num = parseInt(e.id.replace('USR', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `USR${String(maxId + 1).padStart(3, '0')}`;
}

// Create new employee
export function createEmployee(
  data: Omit<User, 'id' | 'createdAt'>
): User {
  const employees = initializeEmployees();
  
  // Check for duplicate email
  const existingEmail = employees.find(
    (e) => e.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existingEmail) {
    throw new Error('Email sudah terdaftar');
  }
  
  const newEmployee: User = {
    ...data,
    id: generateEmployeeId(),
    createdAt: new Date(),
  };
  
  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
}

// Update existing employee
export function updateEmployee(
  id: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>
): User | null {
  const employees = initializeEmployees();
  const index = employees.findIndex((e) => e.id === id);
  
  if (index === -1) return null;
  
  // Check for duplicate email (excluding current employee)
  if (data.email) {
    const existingEmail = employees.find(
      (e) => e.email.toLowerCase() === data.email!.toLowerCase() && e.id !== id
    );
    if (existingEmail) {
      throw new Error('Email sudah terdaftar');
    }
  }
  
  const updatedEmployee: User = {
    ...employees[index],
    ...data,
  };
  
  employees[index] = updatedEmployee;
  saveEmployees(employees);
  return updatedEmployee;
}

// Delete employee
export function deleteEmployee(id: string): boolean {
  const employees = initializeEmployees();
  const index = employees.findIndex((e) => e.id === id);
  
  if (index === -1) return false;
  
  employees.splice(index, 1);
  saveEmployees(employees);
  return true;
}
