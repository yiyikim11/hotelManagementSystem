import {
  Reservation, Charge, Guest, User, FrontOfficeOperation,
  RoomType, OnlineBooking, Promotion, WebsiteRoomListing,
  RoomStatus, HousekeepingTask, MaintenanceRequest, LostFoundItem,
  MenuItem, Modifier, RestaurantOrder, TableReservation, RestaurantInventory,
  InventoryItem, StockMovement, Supplier, PurchaseRecord,
  PaymentTransaction
} from '../types';

// Mock data store (in-memory with localStorage persistence for room types)
class DataStore {
  // Module 2: Booking Engine
  roomTypes: RoomType[];

  constructor() {
    console.log('[DataStore] Constructor called - initializing room types');

    // Test if localStorage is available
    try {
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
      console.log('[DataStore] localStorage is available and working');
    } catch (e) {
      console.error('[DataStore] localStorage is NOT available:', e);
    }

    // Load room types (will return defaults if nothing in localStorage)
    this.roomTypes = this.loadRoomTypes();

    // If loadRoomTypes returned defaults (localStorage was empty), save them now
    const STORAGE_KEY = 'hotel_room_types';
    const existingData = localStorage.getItem(STORAGE_KEY);

    if (!existingData || existingData.trim() === '') {
      console.log('[DataStore] No data in localStorage - saving initial defaults');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.roomTypes));
        console.log('[DataStore] Initial defaults saved successfully');
      } catch (e) {
        console.error('[DataStore] Failed to save initial defaults:', e);
      }
    }

    console.log('[DataStore] Constructor complete. Room types count:', this.roomTypes.length);
  }

  // Module 1: PMS
  reservations: Reservation[] = [
    {
      id: 'RES001',
      guestId: 'G001',
      roomNumber: '101',
      roomType: 'Standard Room',
      checkIn: '2026-05-28',
      checkOut: '2026-05-30',
      adults: 2,
      children: 0,
      status: 'checked-in',
      totalAmount: 450,
      paidAmount: 200,
      specialRequests: 'Late check-out requested',
      source: 'walk-in',
      createdAt: '2026-05-20T10:00:00Z'
    },
    {
      id: 'RES002',
      guestId: 'G002',
      roomNumber: '205',
      roomType: 'Deluxe Room',
      checkIn: '2026-05-29',
      checkOut: '2026-06-02',
      adults: 2,
      children: 1,
      status: 'confirmed',
      totalAmount: 800,
      paidAmount: 800,
      source: 'website',
      onlineBookingId: 'OB001',
      createdAt: '2026-05-15T14:30:00Z'
    },
    {
      id: 'RES003',
      guestId: 'G003',
      roomNumber: '310',
      roomType: 'Executive Suite',
      checkIn: '2026-05-27',
      checkOut: '2026-05-29',
      adults: 1,
      children: 0,
      status: 'checked-in',
      totalAmount: 350,
      paidAmount: 350,
      source: 'walk-in',
      createdAt: '2026-05-25T09:15:00Z'
    },
    {
      id: 'RES004',
      guestId: 'G001',
      roomNumber: '102',
      roomType: 'Standard Room',
      checkIn: '2026-06-01',
      checkOut: '2026-06-03',
      adults: 2,
      children: 0,
      status: 'confirmed',
      totalAmount: 420,
      paidAmount: 0,
      source: 'walk-in',
      createdAt: '2026-05-22T11:00:00Z'
    },
    {
      id: 'RES005',
      guestId: 'G002',
      roomNumber: '208',
      roomType: 'Deluxe Room',
      checkIn: '2026-06-05',
      checkOut: '2026-06-07',
      adults: 3,
      children: 0,
      status: 'pending',
      totalAmount: 500,
      paidAmount: 0,
      source: 'walk-in',
      createdAt: '2026-05-26T15:20:00Z'
    },
    {
      id: 'RES006',
      guestId: 'G003',
      roomNumber: '405',
      roomType: 'Presidential Suite',
      checkIn: '2026-06-10',
      checkOut: '2026-06-12',
      adults: 2,
      children: 1,
      status: 'confirmed',
      totalAmount: 600,
      paidAmount: 300,
      source: 'walk-in',
      createdAt: '2026-05-27T09:00:00Z'
    },
    {
      id: 'RES007',
      guestId: 'G001',
      roomNumber: '203',
      roomType: 'Deluxe Room',
      checkIn: '2026-04-15',
      checkOut: '2026-04-18',
      adults: 2,
      children: 0,
      status: 'checked-out',
      totalAmount: 600,
      paidAmount: 600,
      actualDeparture: '2026-04-18',
      source: 'walk-in',
      createdAt: '2026-04-10T10:00:00Z'
    },
    {
      id: 'RES008',
      guestId: 'G001',
      roomNumber: '305',
      roomType: 'Executive Suite',
      checkIn: '2026-03-10',
      checkOut: '2026-03-12',
      adults: 2,
      children: 1,
      status: 'checked-out',
      totalAmount: 500,
      paidAmount: 500,
      actualDeparture: '2026-03-12',
      source: 'website',
      createdAt: '2026-03-05T14:00:00Z'
    },
    {
      id: 'RES009',
      guestId: 'G002',
      roomNumber: '401',
      roomType: 'Presidential Suite',
      checkIn: '2026-01-20',
      checkOut: '2026-01-23',
      adults: 2,
      children: 0,
      status: 'checked-out',
      totalAmount: 750,
      paidAmount: 750,
      actualDeparture: '2026-01-23',
      source: 'website',
      createdAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'RES010',
      guestId: 'G004',
      roomNumber: '105',
      roomType: 'Standard Room',
      checkIn: '2026-05-28',
      checkOut: '2026-05-31',
      adults: 1,
      children: 0,
      status: 'cancelled',
      totalAmount: 360,
      paidAmount: 0,
      source: 'walk-in',
      createdAt: '2026-05-26T08:30:00Z'
    }
  ];

  charges: Charge[] = [
    {
      id: 'CHG001',
      reservationId: 'RES001',
      type: 'room',
      description: 'Room charge - 2 nights',
      amount: 400,
      date: '2026-05-28',
      isPaid: false
    },
    {
      id: 'CHG002',
      reservationId: 'RES002',
      type: 'room',
      description: 'Room charge - 4 nights',
      amount: 720,
      date: '2026-05-29',
      isPaid: true
    },
    {
      id: 'CHG003',
      reservationId: 'RES003',
      type: 'room',
      description: 'Room charge - 2 nights',
      amount: 320,
      date: '2026-05-27',
      isPaid: true
    },
    {
      id: 'CHG004',
      reservationId: 'RES004',
      type: 'minibar',
      description: 'Minibar items',
      amount: 45,
      date: '2026-06-01',
      isPaid: false
    },
    {
      id: 'CHG005',
      reservationId: 'RES005',
      type: 'laundry',
      description: 'Laundry service',
      amount: 25,
      date: '2026-06-05',
      isPaid: false
    },
    {
      id: 'CHG006',
      reservationId: 'RES006',
      type: 'food',
      description: 'Room service breakfast',
      amount: 35,
      date: '2026-06-10',
      isPaid: false
    }
  ];

  guests: Guest[] = [
    {
      id: 'G001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      address: '123 Main St, New York, NY',
      nationality: 'USA',
      idType: 'Passport',
      idNumber: 'P1234567',
      issuingCountry: 'USA',
      preferences: 'Non-smoking, high floor',
      totalStays: 15,
      totalSpent: 12500,
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'G002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0102',
      dateOfBirth: '1990-07-22',
      gender: 'Female',
      nationality: 'USA',
      idType: 'Driver\'s License',
      idNumber: 'DL789456',
      issuingCountry: 'USA',
      totalStays: 3,
      totalSpent: 2400,
      createdAt: '2025-06-20T00:00:00Z'
    },
    {
      id: 'G003',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'm.chen@email.com',
      phone: '+1-555-0103',
      dateOfBirth: '1995-11-08',
      gender: 'Male',
      nationality: 'Canada',
      idType: 'Passport',
      idNumber: 'C9876543',
      issuingCountry: 'Canada',
      totalStays: 1,
      totalSpent: 350,
      createdAt: '2026-05-25T00:00:00Z'
    },
    {
      id: 'G004',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-0104',
      dateOfBirth: '1988-04-30',
      gender: 'Female',
      nationality: 'USA',
      idType: 'Passport',
      idNumber: 'P7654321',
      issuingCountry: 'USA',
      totalStays: 2,
      totalSpent: 720,
      createdAt: '2026-05-26T00:00:00Z'
    }
  ];

  users: User[] = [
    {
      id: 'U001',
      username: 'admin',
      fullName: 'Admin User',
      email: 'admin@hotel.com',
      role: 'admin',
      department: 'Management',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'U002',
      username: 'jdoe',
      fullName: 'Jane Doe',
      email: 'jdoe@hotel.com',
      role: 'manager',
      department: 'Front Office',
      isActive: true,
      createdAt: '2024-03-15T00:00:00Z'
    },
    {
      id: 'U003',
      username: 'bwilson',
      fullName: 'Bob Wilson',
      email: 'bwilson@hotel.com',
      role: 'staff',
      department: 'Housekeeping',
      isActive: true,
      createdAt: '2024-06-01T00:00:00Z'
    }
  ];

  frontOfficeOps: FrontOfficeOperation[] = [
    {
      id: 'FO001',
      type: 'check-in',
      reservationId: 'RES001',
      performedBy: 'U002',
      timestamp: '2026-05-28T14:00:00Z',
      notes: 'Early check-in processed'
    },
    {
      id: 'FO002',
      type: 'deposit',
      reservationId: 'RES001',
      performedBy: 'U002',
      timestamp: '2026-05-28T14:05:00Z',
      amount: 200,
      notes: 'Deposit collected'
    }
  ];

  private loadRoomTypes(): RoomType[] {
    const STORAGE_KEY = 'hotel_room_types';
    console.log('[DataStore] loadRoomTypes() called');

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('[DataStore] localStorage.getItem result:', saved ? `Found (${saved.length} chars)` : 'Not found');

      if (saved && saved.trim().length > 0) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('[DataStore] Successfully loaded room types from localStorage:', parsed.length, 'rooms');
            console.log('[DataStore] Room names:', parsed.map((r: RoomType) => r.name));
            return parsed;
          } else {
            console.warn('[DataStore] Parsed data is not a valid array or is empty - will return defaults');
          }
        } catch (e) {
          console.error('[DataStore] Failed to parse saved room types - will return defaults:', e);
        }
      }
    } catch (e) {
      console.error('[DataStore] Error accessing localStorage - will return defaults:', e);
    }

    // Default room types (will be saved by constructor if localStorage is empty)
    console.log('[DataStore] Returning default room types');
    const defaultRooms: RoomType[] = [
      {
        id: 'RT001',
        name: 'Standard Room',
        description: 'Comfortable room with essential amenities',
        capacity: 2,
        basePrice: 150,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'],
        totalRooms: 20
      },
      {
        id: 'RT002',
        name: 'Deluxe Room',
        description: 'Spacious room with premium amenities',
        capacity: 2,
        basePrice: 250,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'City View'],
        totalRooms: 15
      },
      {
        id: 'RT003',
        name: 'Family Suite',
        description: 'Large suite perfect for families',
        capacity: 4,
        basePrice: 400,
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Kitchenette', 'Living Area', 'Ocean View'],
        totalRooms: 10
      }
    ];

    return defaultRooms;
  }

  onlineBookings: OnlineBooking[] = [
    {
      id: 'OB001',
      guestName: 'Alice Brown',
      guestEmail: 'alice@email.com',
      guestPhone: '+1-555-0201',
      roomTypeId: 'RT002',
      checkIn: '2026-06-05',
      checkOut: '2026-06-08',
      guests: 2,
      totalAmount: 750,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      status: 'confirmed',
      createdAt: '2026-05-25T16:30:00Z'
    }
  ];

  promotions: Promotion[] = [
    {
      id: 'PR001',
      code: 'SUMMER25',
      name: 'Summer Special',
      description: '25% off on all bookings',
      discountType: 'percentage',
      discountValue: 25,
      validFrom: '2026-06-01',
      validTo: '2026-08-31',
      minNights: 3,
      isActive: true
    },
    {
      id: 'PR002',
      code: 'WEEKEND50',
      name: 'Weekend Getaway',
      description: '$50 off weekend stays',
      discountType: 'fixed',
      discountValue: 50,
      validFrom: '2026-05-01',
      validTo: '2026-12-31',
      minNights: 2,
      isActive: true
    },
    {
      id: 'PR003',
      code: 'CORPORATE',
      name: 'Corporate Rate',
      description: '15% off for corporate bookings',
      discountType: 'percentage',
      discountValue: 15,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      isActive: true
    },
    {
      id: 'PR004',
      code: 'EARLYBIRD',
      name: 'Early Bird Special',
      description: '$75 off for bookings 30+ days in advance',
      discountType: 'fixed',
      discountValue: 75,
      validFrom: '2026-05-01',
      validTo: '2026-12-31',
      isActive: true
    }
  ];

  websiteRoomListings: WebsiteRoomListing[] = [
    {
      roomTypeId: 'RT001',
      isPublished: true,
      websiteDescription: 'Perfect for solo travelers or couples. Our Standard Rooms offer comfort and convenience with all essential amenities for a pleasant stay.',
      websitePhotos: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'],
      displayOrder: 1,
      lastUpdated: '2026-05-15T10:00:00Z'
    },
    {
      roomTypeId: 'RT002',
      isPublished: true,
      websiteDescription: 'Spacious and elegant, our Deluxe Rooms feature premium furnishings, stunning city views, and upgraded amenities for the discerning traveler.',
      websitePhotos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
      displayOrder: 2,
      promotionalRate: 225,
      promotionalRateDescription: 'Special Offer - Save 10%',
      lastUpdated: '2026-05-20T14:30:00Z'
    },
    {
      roomTypeId: 'RT003',
      isPublished: true,
      websiteDescription: 'Ideal for families, our Family Suites provide ample space with a separate living area, kitchenette, and breathtaking ocean views.',
      websitePhotos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
      displayOrder: 3,
      featuredAmenities: ['Ocean View', 'Kitchenette', 'Living Area', 'Sleeps 4'],
      lastUpdated: '2026-05-18T09:00:00Z'
    }
  ];

  paymentTransactions: PaymentTransaction[] = [
    {
      id: 'PT001',
      bookingId: 'OB001',
      amount: 750,
      paymentMethod: 'card',
      transactionType: 'full',
      transactionStatus: 'completed',
      gatewayTransactionId: 'TXN1716840000ABC123',
      cardLastFour: '4242',
      cardType: 'Visa',
      paymentDate: '2026-05-25T16:35:00Z'
    }
  ];

  // Module 3: Housekeeping
  roomStatuses: RoomStatus[] = [
    // Floor 1 - Standard Rooms
    { roomNumber: '101', floor: 1, type: 'Standard', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T08:00:00Z', assignedTo: 'bwilson' },
    { roomNumber: '102', floor: 1, type: 'Standard', cleaningStatus: 'dirty', occupancyStatus: 'vacant', assignedTo: 'bwilson' },
    { roomNumber: '103', floor: 1, type: 'Standard', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-28T10:00:00Z' },
    { roomNumber: '104', floor: 1, type: 'Standard', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T07:30:00Z', assignedTo: 'bwilson' },
    { roomNumber: '105', floor: 1, type: 'Standard', cleaningStatus: 'dirty', occupancyStatus: 'vacant' },
    { roomNumber: '106', floor: 1, type: 'Standard', cleaningStatus: 'inspected', occupancyStatus: 'reserved', lastCleaned: '2026-05-28T09:15:00Z' },
    { roomNumber: '107', floor: 1, type: 'Standard', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-28T11:00:00Z' },
    { roomNumber: '108', floor: 1, type: 'Standard', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-27T16:00:00Z', assignedTo: 'bwilson' },

    // Floor 2 - Deluxe Rooms
    { roomNumber: '201', floor: 2, type: 'Deluxe', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-28T09:00:00Z' },
    { roomNumber: '202', floor: 2, type: 'Deluxe', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T08:30:00Z', assignedTo: 'bwilson' },
    { roomNumber: '203', floor: 2, type: 'Deluxe', cleaningStatus: 'dirty', occupancyStatus: 'vacant' },
    { roomNumber: '204', floor: 2, type: 'Deluxe', cleaningStatus: 'inspected', occupancyStatus: 'reserved', lastCleaned: '2026-05-28T10:30:00Z' },
    { roomNumber: '205', floor: 2, type: 'Deluxe', cleaningStatus: 'ready', occupancyStatus: 'reserved', lastCleaned: '2026-05-27T15:00:00Z' },
    { roomNumber: '206', floor: 2, type: 'Deluxe', cleaningStatus: 'out-of-order', occupancyStatus: 'vacant', notes: 'AC repair needed' },
    { roomNumber: '207', floor: 2, type: 'Deluxe', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T07:00:00Z', assignedTo: 'bwilson' },
    { roomNumber: '208', floor: 2, type: 'Deluxe', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-28T11:30:00Z' },

    // Floor 3 - Executive Suites
    { roomNumber: '301', floor: 3, type: 'Executive Suite', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T08:00:00Z', assignedTo: 'bwilson' },
    { roomNumber: '302', floor: 3, type: 'Executive Suite', cleaningStatus: 'inspected', occupancyStatus: 'reserved', lastCleaned: '2026-05-28T09:30:00Z' },
    { roomNumber: '303', floor: 3, type: 'Executive Suite', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-28T10:00:00Z' },
    { roomNumber: '304', floor: 3, type: 'Executive Suite', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-27T14:00:00Z', assignedTo: 'bwilson' },
    { roomNumber: '305', floor: 3, type: 'Executive Suite', cleaningStatus: 'dirty', occupancyStatus: 'vacant' },
    { roomNumber: '306', floor: 3, type: 'Executive Suite', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-28T11:00:00Z' },

    // Floor 4 - Premium Suites
    { roomNumber: '401', floor: 4, type: 'Premium Suite', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T07:00:00Z', assignedTo: 'bwilson' },
    { roomNumber: '402', floor: 4, type: 'Premium Suite', cleaningStatus: 'inspected', occupancyStatus: 'reserved', lastCleaned: '2026-05-28T09:00:00Z' },
    { roomNumber: '403', floor: 4, type: 'Premium Suite', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-27T16:00:00Z' },
    { roomNumber: '404', floor: 4, type: 'Premium Suite', cleaningStatus: 'out-of-service', occupancyStatus: 'vacant', notes: 'Renovation in progress' },
    { roomNumber: '405', floor: 4, type: 'Premium Suite', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T08:00:00Z', assignedTo: 'bwilson' },

    // Floor 5 - Presidential Suites
    { roomNumber: '501', floor: 5, type: 'Presidential Suite', cleaningStatus: 'inspected', occupancyStatus: 'reserved', lastCleaned: '2026-05-28T06:00:00Z' },
    { roomNumber: '502', floor: 5, type: 'Presidential Suite', cleaningStatus: 'ready', occupancyStatus: 'vacant', lastCleaned: '2026-05-27T18:00:00Z' },
    { roomNumber: '503', floor: 5, type: 'Presidential Suite', cleaningStatus: 'clean', occupancyStatus: 'occupied', lastCleaned: '2026-05-28T07:00:00Z', assignedTo: 'bwilson' },
  ];

  housekeepingTasks: HousekeepingTask[] = [
    {
      id: 'HT001',
      roomNumber: '102',
      type: 'departure',
      assignedTo: 'U003',
      priority: 'high',
      status: 'pending',
      scheduledFor: '2026-05-28T11:00:00Z',
      notes: 'Guest checked out at 10:30 AM'
    },
    {
      id: 'HT002',
      roomNumber: '101',
      type: 'stayover',
      assignedTo: 'U003',
      priority: 'medium',
      status: 'completed',
      scheduledFor: '2026-05-28T08:00:00Z',
      completedAt: '2026-05-28T08:45:00Z'
    }
  ];

  maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'MR001',
      roomNumber: '206',
      issue: 'Air conditioning not cooling',
      priority: 'high',
      status: 'in-progress',
      reportedBy: 'U003',
      assignedTo: 'Maintenance Team',
      reportedAt: '2026-05-27T14:30:00Z',
      expectedCompletion: '2026-05-29T12:00:00Z'
    },
    {
      id: 'MR002',
      roomNumber: '310',
      issue: 'Leaking faucet in bathroom',
      priority: 'medium',
      status: 'open',
      reportedBy: 'Guest',
      reportedAt: '2026-05-28T09:00:00Z'
    }
  ];

  lostFoundItems: LostFoundItem[] = [
    {
      id: 'LF001',
      roomNumber: '102',
      description: 'Black leather wallet',
      category: 'Personal Item',
      foundDate: '2026-05-27',
      foundBy: 'U003',
      status: 'unclaimed',
      storageLocation: 'Front Desk Safe'
    },
    {
      id: 'LF002',
      roomNumber: '205',
      description: 'iPhone charger',
      category: 'Electronics',
      foundDate: '2026-05-26',
      foundBy: 'U003',
      status: 'claimed',
      claimedBy: 'G002',
      claimedDate: '2026-05-27'
    }
  ];

  // Module 4: Restaurant
  modifiers: Modifier[] = [
    { id: 'MOD001', name: 'Extra Cheese', type: 'addition', price: 2, category: 'Toppings', isActive: true },
    { id: 'MOD002', name: 'No Onions', type: 'removal', price: 0, category: 'Preferences', isActive: true },
    { id: 'MOD003', name: 'Extra Bacon', type: 'addition', price: 3, category: 'Toppings', isActive: true },
    { id: 'MOD004', name: 'Gluten-Free Bread', type: 'substitution', price: 2, category: 'Dietary', isActive: true },
    { id: 'MOD005', name: 'Extra Sauce', type: 'addition', price: 1, category: 'Toppings', isActive: true },
    { id: 'MOD006', name: 'Well Done', type: 'substitution', price: 0, category: 'Cooking Preference', isActive: true },
    { id: 'MOD007', name: 'Medium Rare', type: 'substitution', price: 0, category: 'Cooking Preference', isActive: true },
    { id: 'MOD008', name: 'No Dairy', type: 'removal', price: 0, category: 'Dietary', isActive: true }
  ];

  menuItems: MenuItem[] = [
    {
      id: 'M001',
      name: 'Caesar Salad',
      category: 'Appetizers',
      description: 'Fresh romaine lettuce with Caesar dressing',
      basePrice: 12,
      isAvailable: true,
      preparationTime: 10,
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop',
      availableModifierIds: ['MOD002', 'MOD005', 'MOD008']
    },
    {
      id: 'M002',
      name: 'Grilled Salmon',
      category: 'Main Course',
      description: 'Atlantic salmon with seasonal vegetables',
      basePrice: 28,
      weekendPrice: 32,
      isAvailable: true,
      preparationTime: 25,
      allergens: ['Fish'],
      imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&auto=format&fit=crop',
      availableModifierIds: ['MOD006', 'MOD007', 'MOD005']
    },
    {
      id: 'M003',
      name: 'Chocolate Lava Cake',
      category: 'Desserts',
      description: 'Warm chocolate cake with vanilla ice cream',
      basePrice: 10,
      isAvailable: true,
      preparationTime: 8,
      allergens: ['Dairy', 'Eggs', 'Gluten'],
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&auto=format&fit=crop',
      availableModifierIds: ['MOD008']
    },
    {
      id: 'M004',
      name: 'Club Sandwich',
      category: 'Main Course',
      description: 'Triple-decker with chicken, bacon, and vegetables',
      basePrice: 16,
      isAvailable: true,
      preparationTime: 15,
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop',
      availableModifierIds: ['MOD001', 'MOD002', 'MOD003', 'MOD004', 'MOD005']
    }
  ];

  restaurantOrders: RestaurantOrder[] = [
    {
      id: 'RO001',
      orderNumber: 'ORD-001',
      type: 'dine-in',
      tableNumber: 'T5',
      items: [
        { menuItemId: 'M001', menuItemName: 'Caesar Salad', quantity: 2, unitPrice: 12 },
        { menuItemId: 'M002', menuItemName: 'Grilled Salmon', quantity: 2, unitPrice: 28 }
      ],
      status: 'preparing',
      totalAmount: 80,
      taxAmount: 8,
      serviceCharge: 8,
      paymentStatus: 'pending',
      createdAt: '2026-05-28T18:30:00Z'
    },
    {
      id: 'RO002',
      orderNumber: 'ORD-002',
      type: 'room-service',
      roomNumber: '101',
      items: [
        { menuItemId: 'M004', menuItemName: 'Club Sandwich', quantity: 1, unitPrice: 16 },
        { menuItemId: 'M003', menuItemName: 'Chocolate Lava Cake', quantity: 1, unitPrice: 10 }
      ],
      status: 'completed',
      totalAmount: 26,
      taxAmount: 2.6,
      serviceCharge: 2.6,
      paymentStatus: 'paid',
      createdAt: '2026-05-28T12:00:00Z',
      completedAt: '2026-05-28T12:45:00Z'
    }
  ];

  tableReservations: TableReservation[] = [
    {
      id: 'TR001',
      guestName: 'David Lee',
      guestPhone: '+1-555-0301',
      tableNumber: 'T8',
      partySize: 4,
      date: '2026-06-01',
      time: '19:00',
      status: 'confirmed',
      specialRequests: 'Window seat preferred'
    },
    {
      id: 'TR002',
      guestName: 'Emma Wilson',
      guestPhone: '+1-555-0302',
      tableNumber: 'T3',
      partySize: 2,
      date: '2026-06-01',
      time: '20:00',
      status: 'confirmed'
    },
    {
      id: 'TR003',
      guestName: 'Michael Chen',
      guestPhone: '+1-555-0303',
      tableNumber: 'T5',
      partySize: 6,
      date: '2026-06-01',
      time: '18:30',
      status: 'seated'
    },
    {
      id: 'TR004',
      guestName: 'Sarah Johnson',
      guestPhone: '+1-555-0304',
      tableNumber: 'T2',
      partySize: 2,
      date: '2026-06-02',
      time: '19:30',
      status: 'confirmed',
      specialRequests: 'Anniversary celebration'
    },
    {
      id: 'TR005',
      guestName: 'Robert Martinez',
      guestPhone: '+1-555-0305',
      tableNumber: 'T7',
      partySize: 8,
      date: '2026-06-03',
      time: '20:00',
      status: 'confirmed',
      specialRequests: 'Birthday party, need cake storage'
    }
  ];

  restaurantInventory: RestaurantInventory[] = [
    { id: 'RI001', itemName: 'Fresh Salmon', category: 'Seafood', unit: 'kg', quantity: 25, minThreshold: 10, unitCost: 18, lastRestocked: '2026-05-27' },
    { id: 'RI002', itemName: 'Romaine Lettuce', category: 'Vegetables', unit: 'heads', quantity: 40, minThreshold: 20, unitCost: 2 },
    { id: 'RI003', itemName: 'Chocolate', category: 'Baking', unit: 'kg', quantity: 8, minThreshold: 5, unitCost: 12, lastRestocked: '2026-05-25' },
  ];

  // Module 5: Hotel Inventory
  inventoryItems: InventoryItem[] = [
    { id: 'INV001', name: 'Bath Towels', category: 'Linens', unit: 'pieces', quantity: 500, minThreshold: 200, unitCost: 8, department: 'Housekeeping', supplier: 'SUP001', lastRestocked: '2026-05-20', stockable: true },
    { id: 'INV002', name: 'Shampoo Bottles', category: 'Toiletries', unit: 'bottles', quantity: 300, minThreshold: 150, unitCost: 2.5, department: 'Housekeeping', supplier: 'SUP002', stockable: true },
    { id: 'INV003', name: 'Minibar Snacks', category: 'Food & Beverage', unit: 'packs', quantity: 180, minThreshold: 100, unitCost: 3, department: 'Front Office', supplier: 'SUP003', lastRestocked: '2026-05-26', stockable: true },
    { id: 'INV004', name: 'Bed Sheets', category: 'Linens', unit: 'sets', quantity: 150, minThreshold: 80, unitCost: 25, department: 'Housekeeping', supplier: 'SUP001', stockable: true },
    { id: 'INV005', name: 'Coffee Pods', category: 'Food & Beverage', unit: 'boxes', quantity: 45, minThreshold: 30, unitCost: 15, department: 'Restaurant', supplier: 'SUP003', stockable: false },
  ];

  stockMovements: StockMovement[] = [
    {
      id: 'SM001',
      itemId: 'INV001',
      itemName: 'Bath Towels',
      type: 'stock-out',
      quantity: 30,
      toLocation: 'Floor 2',
      performedBy: 'U003',
      date: '2026-05-28T08:00:00Z',
      reason: 'Daily usage'
    },
    {
      id: 'SM002',
      itemId: 'INV002',
      itemName: 'Shampoo Bottles',
      type: 'stock-in',
      quantity: 100,
      toLocation: 'Main Storage',
      performedBy: 'U001',
      date: '2026-05-27T10:00:00Z',
      cost: 250
    },
    {
      id: 'SM003',
      itemId: 'INV003',
      itemName: 'Minibar Snacks',
      type: 'damaged',
      quantity: 5,
      performedBy: 'U002',
      date: '2026-05-26T14:00:00Z',
      reason: 'Expired items'
    }
  ];

  suppliers: Supplier[] = [
    {
      id: 'SUP001',
      name: 'Premier Linens Supply',
      contactPerson: 'Robert Martinez',
      email: 'robert@premierlinens.com',
      phone: '+1-555-1001',
      address: '456 Industrial Ave, Boston, MA',
      category: ['Linens', 'Bedding'],
      paymentTerms: 'Net 30',
      isActive: true,
      rating: 4.5
    },
    {
      id: 'SUP002',
      name: 'EcoClean Toiletries',
      contactPerson: 'Lisa Chen',
      email: 'lisa@ecoclean.com',
      phone: '+1-555-1002',
      address: '789 Green St, Portland, OR',
      category: ['Toiletries', 'Cleaning Supplies'],
      paymentTerms: 'Net 15',
      isActive: true,
      rating: 4.8
    },
    {
      id: 'SUP003',
      name: 'Fresh Foods Distributor',
      contactPerson: 'Tom Baker',
      email: 'tom@freshfoods.com',
      phone: '+1-555-1003',
      address: '321 Market Rd, Seattle, WA',
      category: ['Food & Beverage'],
      paymentTerms: 'COD',
      isActive: true,
      rating: 4.2
    }
  ];

  purchaseRecords: PurchaseRecord[] = [
    {
      id: 'PUR001',
      supplierId: 'SUP001',
      supplierName: 'Premier Linens Supply',
      items: [
        { itemId: 'INV001', itemName: 'Bath Towels', quantity: 200, unitCost: 8 },
        { itemId: 'INV004', itemName: 'Bed Sheets', quantity: 50, unitCost: 25 }
      ],
      totalAmount: 2850,
      orderDate: '2026-05-15',
      deliveryDate: '2026-05-20',
      status: 'delivered',
      invoiceNumber: 'INV-2026-001',
      paymentStatus: 'paid'
    },
    {
      id: 'PUR002',
      supplierId: 'SUP002',
      supplierName: 'EcoClean Toiletries',
      items: [
        { itemId: 'INV002', itemName: 'Shampoo Bottles', quantity: 500, unitCost: 2.5 }
      ],
      totalAmount: 1250,
      orderDate: '2026-05-20',
      deliveryDate: '2026-05-27',
      status: 'delivered',
      invoiceNumber: 'INV-2026-002',
      paymentStatus: 'pending'
    }
  ];

  // Helper methods to get data
  getReservations() { return this.reservations; }
  getCharges() { return this.charges; }
  getGuests() { return this.guests; }
  getUsers() { return this.users; }
  getFrontOfficeOps() { return this.frontOfficeOps; }
  getRoomTypes() {
    console.log('[DataStore] getRoomTypes() called - returning', this.roomTypes.length, 'rooms');
    return this.roomTypes;
  }

  saveRoomTypes() {
    const STORAGE_KEY = 'hotel_room_types';
    console.log('[DataStore] saveRoomTypes() called');
    console.log('[DataStore] Current roomTypes array:', this.roomTypes);
    console.log('[DataStore] Saving room types to localStorage:', this.roomTypes.length, 'rooms');

    try {
      const jsonString = JSON.stringify(this.roomTypes);
      console.log('[DataStore] JSON string length:', jsonString.length);

      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('[DataStore] localStorage.setItem() completed');

      // Verify it was saved
      const verification = localStorage.getItem(STORAGE_KEY);
      console.log('[DataStore] Verification - Can read back:', verification ? 'Yes' : 'No');

      if (verification) {
        const parsed = JSON.parse(verification);
        console.log('[DataStore] Verification - Parsed length:', parsed.length);
      }
    } catch (error) {
      console.error('[DataStore] ERROR in saveRoomTypes():', error);
      throw error;
    }
  }
  getOnlineBookings() { return this.onlineBookings; }
  getPromotions() { return this.promotions; }
  getWebsiteRoomListings() { return this.websiteRoomListings; }
  getPaymentTransactions() { return this.paymentTransactions; }
  getRoomStatuses() { return this.roomStatuses; }
  getHousekeepingTasks() { return this.housekeepingTasks; }
  getMaintenanceRequests() { return this.maintenanceRequests; }
  getLostFoundItems() { return this.lostFoundItems; }
  getModifiers() { return this.modifiers; }
  getMenuItems() { return this.menuItems; }
  getRestaurantOrders() { return this.restaurantOrders; }
  getTableReservations() { return this.tableReservations; }
  getRestaurantInventory() { return this.restaurantInventory; }
  getInventoryItems() { return this.inventoryItems; }
  getStockMovements() { return this.stockMovements; }
  getSuppliers() { return this.suppliers; }
  getPurchaseRecords() { return this.purchaseRecords; }

  // Sync online booking to PMS reservation
  syncOnlineBookingToPMS(onlineBooking: OnlineBooking, roomNumber: string): Reservation {
    // Check if this online booking is already synced
    const existingReservation = this.reservations.find(r => r.onlineBookingId === onlineBooking.id);
    if (existingReservation) {
      return existingReservation;
    }

    // Get room type name from room type ID
    const roomType = this.roomTypes.find(rt => rt.id === onlineBooking.roomTypeId);

    // Generate new reservation ID
    const newReservationId = `RES${String(this.reservations.length + 1).padStart(3, '0')}`;

    // Create or find guest record
    let guestId = this.guests.find(g => g.email === onlineBooking.guestEmail)?.id;

    if (!guestId) {
      // Create new guest from booking data
      guestId = `G${String(this.guests.length + 1).padStart(3, '0')}`;
      const nameParts = onlineBooking.guestName.split(' ');
      const newGuest: Guest = {
        id: guestId,
        firstName: nameParts[0] || onlineBooking.guestName,
        lastName: nameParts.slice(1).join(' ') || '',
        email: onlineBooking.guestEmail,
        phone: onlineBooking.guestPhone,
        totalStays: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };
      this.guests.push(newGuest);
    }

    // Create PMS reservation
    const newReservation: Reservation = {
      id: newReservationId,
      guestId: guestId,
      roomNumber: roomNumber,
      roomType: roomType?.name,
      checkIn: onlineBooking.checkIn,
      checkOut: onlineBooking.checkOut,
      adults: onlineBooking.guests,
      children: 0,
      status: onlineBooking.paymentStatus === 'paid' ? 'confirmed' : 'pending',
      totalAmount: onlineBooking.totalAmount,
      paidAmount: onlineBooking.paymentStatus === 'paid' ? onlineBooking.totalAmount : 0,
      source: 'website',
      onlineBookingId: onlineBooking.id,
      createdAt: onlineBooking.createdAt
    };

    this.reservations.push(newReservation);
    return newReservation;
  }
}

export const dataStore = new DataStore();
