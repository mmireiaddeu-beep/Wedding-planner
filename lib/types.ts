export type RSVPStatus = 'pending' | 'confirmed' | 'declined';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
export type TaskPriority = 'low' | 'medium' | 'high';
export type VendorStatus = 'contacted' | 'negotiating' | 'confirmed' | 'paid' | 'cancelled';
export type GuestSide = 'bride' | 'groom' | 'both';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  allergies: string[];
  diet: DietType;
  rsvp: RSVPStatus;
  tableId: string;
  side: GuestSide;
  notes: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  guestIds: string[];
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  priority: TaskPriority;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  contactName: string;
  email: string;
  phone: string;
  totalPrice: number;
  depositPaid: number;
  status: VendorStatus;
  notes: string;
  website: string;
}

export interface Payment {
  id: string;
  vendorId: string;
  description: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate: string;
  notes: string;
}
