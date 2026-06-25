import { createBrowserRouter, Navigate } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import PMSReservations from "./components/pms/Reservations";
import PMSCharges from "./components/pms/Charges";
import PMSGuests from "./components/pms/Guests";
import PMSReports from "./components/pms/Reports";
import PMSFrontOffice from "./components/pms/FrontOffice";
import PMSUsers from "./components/pms/Users";
import PMSRatePlans from "./components/pms/RatePlans";
import PMSCancellationPolicies from "./components/pms/CancellationPolicies";
import PMSRoomTypes from "./components/pms/RoomTypes";
import PMSRooms from "./components/pms/Rooms";
import BookingRooms from "./components/booking/Rooms";
import BookingPromoCodes from "./components/booking/PromoCodes";
import BookingNotifications from "./components/booking/Notifications";
import HousekeepingRooms from "./components/housekeeping/Rooms";
import HousekeepingTasks from "./components/housekeeping/Tasks";
import HousekeepingMaintenance from "./components/housekeeping/Maintenance";
import HousekeepingLostFound from "./components/housekeeping/LostFound";
import HousekeepingReports from "./components/housekeeping/Reports";
import RestaurantMenu from "./components/restaurant/Menu";
import RestaurantOrders from "./components/restaurant/Orders";
import RestaurantReservations from "./components/restaurant/Reservations";
import RestaurantBilling from "./components/restaurant/Billing";
import RestaurantInventory from "./components/restaurant/Inventory";
import RestaurantModifiers from "./components/restaurant/Modifiers";
import RestaurantTables from "./components/restaurant/Tables";
import EmailCampaigns from "./components/email/Campaigns";
import PublicLayout from "./components/public/PublicLayout";
import PublicHome from "./components/public/Home";
import PublicRoomListing from "./components/public/RoomListing";
import PublicCheckout from "./components/public/Checkout";
import PublicConfirmation from "./components/public/Confirmation";
import PublicOffers from "./components/public/Offers";
import PublicMyBookings from "./components/public/MyBookings";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/hotel" replace /> },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  {
    path: "/hotel",
    Component: PublicLayout,
    children: [
      { index: true, Component: PublicHome },
      { path: "rooms", Component: PublicRoomListing },
      { path: "checkout", Component: PublicCheckout },
      { path: "confirmation/:bookingId", Component: PublicConfirmation },
      { path: "offers", Component: PublicOffers },
      { path: "my-bookings", Component: PublicMyBookings },
    ],
  },
  {
    path: "/admin",
    Component: Root,
    children: [
      { index: true, element: <Navigate to="/admin/pms/reports" replace /> },
      { path: "pms/reservations", Component: PMSReservations },
      { path: "pms/charges", Component: PMSCharges },
      { path: "pms/guests", Component: PMSGuests },
      { path: "pms/reports", Component: PMSReports },
      { path: "pms/front-office", Component: PMSFrontOffice },
      { path: "pms/users", Component: PMSUsers },
      { path: "pms/rate-plans", Component: PMSRatePlans },
      { path: "pms/cancellation-policies", Component: PMSCancellationPolicies },
      { path: "pms/room-types", Component: PMSRoomTypes },
      { path: "pms/rooms", Component: PMSRooms },
      { path: "booking/rooms", Component: BookingRooms },
      { path: "booking/promo-codes", Component: BookingPromoCodes },
      { path: "booking/notifications", Component: BookingNotifications },
      { path: "housekeeping/rooms", Component: HousekeepingRooms },
      { path: "housekeeping/tasks", Component: HousekeepingTasks },
      { path: "housekeeping/maintenance", Component: HousekeepingMaintenance },
      { path: "housekeeping/lost-found", Component: HousekeepingLostFound },
      { path: "housekeeping/reports", Component: HousekeepingReports },
      { path: "restaurant/menu", Component: RestaurantMenu },
      { path: "restaurant/orders", Component: RestaurantOrders },
      { path: "restaurant/reservations", Component: RestaurantReservations },
      { path: "restaurant/billing", Component: RestaurantBilling },
      { path: "restaurant/inventory", Component: RestaurantInventory },
      { path: "restaurant/modifiers", Component: RestaurantModifiers },
      { path: "restaurant/tables", Component: RestaurantTables },
      { path: "email/campaigns", Component: EmailCampaigns },
    ],
  },
  { path: "*", Component: NotFound },
]);
