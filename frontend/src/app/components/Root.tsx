import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Hotel, Calendar, ClipboardList, Utensils, Mail, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Toaster } from "./ui/sonner";

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const navigation = [
    {
      name: "Property Management",
      icon: Hotel,
      children: [
        { name: "Reports & Dashboard", path: "/admin/pms/reports" },
        { name: "Reservations", path: "/admin/pms/reservations" },
        { name: "Charges & Invoicing", path: "/admin/pms/charges" },
        { name: "Guest Profiles", path: "/admin/pms/guests" },
        { name: "Front Office", path: "/admin/pms/front-office" },
        { name: "Room Types", path: "/admin/pms/room-types" },
        { name: "Rate Plans", path: "/admin/pms/rate-plans" },
        { name: "Cancellation Policies", path: "/admin/pms/cancellation-policies" },
        { name: "User Management", path: "/admin/pms/users" },
      ],
    },
    {
      name: "Booking Engine",
      icon: Calendar,
      children: [
        { name: "Website Room Listings", path: "/admin/booking/rooms" },
        { name: "Promo Codes", path: "/admin/booking/promo-codes" },
      ],
    },
    {
      name: "Housekeeping",
      icon: ClipboardList,
      children: [
        { name: "Room Status", path: "/admin/housekeeping/rooms" },
        { name: "Tasks", path: "/admin/housekeeping/tasks" },
        { name: "Maintenance", path: "/admin/housekeeping/maintenance" },
        { name: "Lost & Found", path: "/admin/housekeeping/lost-found" },
        { name: "Reports", path: "/admin/housekeeping/reports" },
      ],
    },
    {
      name: "Restaurant",
      icon: Utensils,
      children: [
        { name: "Menu Management", path: "/admin/restaurant/menu" },
        { name: "Modifiers", path: "/admin/restaurant/modifiers" },
        { name: "Table Management", path: "/admin/restaurant/tables" },
        { name: "Orders", path: "/admin/restaurant/orders" },
        { name: "Table Reservations", path: "/admin/restaurant/reservations" },
        { name: "Billing & Payments", path: "/admin/restaurant/billing" },
        { name: "Inventory & Stock", path: "/admin/restaurant/inventory" },
      ],
    },
    {
      name: "Email Campaigns",
      icon: Mail,
      children: [
        { name: "Campaigns", path: "/admin/email/campaigns" },
      ],
    },
  ];

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  const isChildActive = (children?: { path: string }[]) =>
    children?.some(c => location.pathname === c.path) ?? false;

  return (
    <div>
      <div className="flex h-screen bg-slate-100">

        {/* ── Sidebar ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white dark:bg-zinc-900
          border-r border-slate-200 dark:border-zinc-800
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>

          {/* Top bar: hamburger toggle + logo */}
          <div className={`flex items-center h-14 px-3 border-b border-slate-200 dark:border-zinc-800 shrink-0 gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {/* Hamburger toggle — desktop */}
            <button
              onClick={() => {
                setSidebarCollapsed(c => !c);
                setMobileMenuOpen(false);
              }}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile close */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden flex p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <Hotel className="w-6 h-6 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white truncate">Hotel Manager</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {navigation.map((item) => {
              const active = item.path
                ? location.pathname === item.path
                : isChildActive(item.children);

              return (
                <div key={item.name}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`
                        flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-sm
                        ${sidebarCollapsed ? 'justify-center' : ''}
                        ${active
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'}
                      `}
                    >
                      <item.icon className="w-[18px] h-[18px] shrink-0" />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  ) : (
                    <div className="mb-1">
                      <div
                        title={sidebarCollapsed ? item.name : undefined}
                        className={`
                          flex items-center gap-3 px-2 py-2 mt-2
                          ${sidebarCollapsed ? 'justify-center' : ''}
                          ${active ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}
                        `}
                      >
                        <item.icon className="w-[18px] h-[18px] shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="text-[11px] font-semibold uppercase tracking-widest">{item.name}</span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="ml-3 space-y-0.5">
                          {item.children?.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`
                                block px-3 py-1.5 rounded-lg text-sm transition-colors
                                ${location.pathname === child.path
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}
                              `}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── Main area ── */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>

          {/* Header */}
          <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">

            {/* Left: mobile hamburger + user profile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* User profile */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{roleLabel}</p>
                </div>
              </div>
            </div>

            {/* Right: logout */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
