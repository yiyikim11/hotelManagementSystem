// Common types
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online' | 'room_charge';

// Module 1: Property Management System
export interface Reservation {
  id: string;
  guestId: string;
  roomNumber: string;
  roomType?: string;
  checkIn: string;
  checkOut: string;
  actualArrival?: string;
  actualDeparture?: string;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  totalAmount: number;
  paidAmount: number;
  specialRequests?: string;
  source: 'website' | 'walk-in';
  onlineBookingId?: string;
  createdAt: string;
  cancellationReason?: string;
}

export interface Charge {
  id: string;
  reservationId: string;
  type: 'room' | 'tax' | 'minibar' | 'laundry' | 'food' | 'other';
  description: string;
  amount: number;
  date: string;
  isPaid: boolean;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  issuingCountry?: string;
  idDocumentImage?: string;
  preferences?: string;
  totalStays: number;
  totalSpent: number;
  createdAt: string;
  vipStatus?: boolean;
  blacklisted?: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  department: string;
  isActive: boolean;
  createdAt: string;
}

export interface FrontOfficeOperation {
  id: string;
  type: 'check-in' | 'check-out' | 'room-change' | 'walk-in' | 'deposit' | 'cancellation';
  reservationId: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
  amount?: number;
}

// Module 2: Booking Engine
export interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
  imageUrl?: string;
  totalRooms: number;
}

// Website Room Listing - extends PMS room types for online display
export interface WebsiteRoomListing {
  roomTypeId: string; // References PMS RoomType.id
  isPublished: boolean;
  websiteDescription?: string; // Custom description for website
  websitePhotos: string[]; // Array of photo URLs
  displayOrder: number;
  promotionalRate?: number;
  promotionalRateDescription?: string;
  featuredAmenities?: string[]; // Highlighted amenities for marketing
  lastUpdated: string;
}

export interface OnlineBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  promoCode?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  cancellationReason?: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validTo: string;
  minNights?: number;
  isActive: boolean;
}

// Module 3: Housekeeping
export interface RoomStatus {
  roomNumber: string;
  floor: number;
  type: string;
  cleaningStatus: 'dirty' | 'clean' | 'inspected' | 'ready' | 'out-of-order' | 'out-of-service';
  occupancyStatus: 'vacant' | 'occupied' | 'reserved';
  lastCleaned?: string;
  assignedTo?: string;
  notes?: string;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  type: 'departure' | 'stayover' | 'turndown' | 'deep-clean';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  scheduledFor: string;
  completedAt?: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  expectedCompletion?: string;
  completedAt?: string;
  cost?: number;
}

export interface LostFoundItem {
  id: string;
  roomNumber: string;
  description: string;
  category: string;
  foundDate: string;
  foundBy: string;
  status: 'unclaimed' | 'claimed' | 'returned' | 'disposed';
  claimedBy?: string;
  claimedDate?: string;
  storageLocation?: string;
  claimContact?: string;
  disposeAt?: string;
}

// Module 4: Restaurant
export interface Modifier {
  id: string;
  name: string;
  type: 'addition' | 'removal' | 'substitution';
  price: number;
  category: string;
  isActive: boolean;
}

export interface SeasonalMenu {
  id: string;
  name: string;
  description: string;
  validFrom: string;
  validTo: string;
  menuItemIds: string[];
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  weekendPrice?: number;
  isAvailable: boolean;
  preparationTime: number;
  allergens?: string[];
  imageUrl?: string;
  availableModifierIds?: string[];
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  type: 'dine-in' | 'room-service';
  tableNumber?: string;
  roomNumber?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  totalAmount: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  completedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  notes?: string;
}

export interface OrderModifier {
  modifierId: string;
  modifierName: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  modifiers?: OrderModifier[];
  notes?: string;
}

export interface TableReservation {
  id: string;
  guestName: string;
  guestPhone: string;
  tableNumber: string;
  partySize: number;
  date: string;
  time: string;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  specialRequests?: string;
}

export interface RestaurantInventory {
  id: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
  minThreshold: number;
  unitCost: number;
  lastRestocked?: string;
}

// Module 5: Hotel Inventory
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minThreshold: number;
  unitCost: number;
  department: string;
  supplier?: string;
  lastRestocked?: string;
  stockable: boolean;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'stock-in' | 'stock-out' | 'transfer' | 'damaged' | 'adjustment';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  performedBy: string;
  date: string;
  reason?: string;
  cost?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string[];
  paymentTerms: string;
  isActive: boolean;
  rating?: number;
}

export interface PurchaseRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  orderDate: string;
  deliveryDate?: string;
  status: 'ordered' | 'delivered' | 'cancelled';
  invoiceNumber?: string;
  paymentStatus: PaymentStatus;
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
}

// Payment Gateway Types
export interface PaymentTransaction {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionType: 'full' | 'partial' | 'refund';
  transactionStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  gatewayTransactionId: string;
  gatewayResponse?: any;
  cardLastFour?: string;
  cardType?: string;
  paymentDate: string;
  notes?: string;
}

export interface PaymentGatewayRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerName: string;
  bookingReference: string;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  };
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  status: string;
  timestamp: string;
  message?: string;
  error?: string;
  cardLastFour?: string;
  cardType?: string;
}

// Email Notification Types
export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  template: 'booking_confirmation' | 'payment_update' | 'cancellation_notice' | 'payment_receipt';
  data: any;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
}
