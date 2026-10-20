"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FiHome, FiGrid, FiUsers, FiDollarSign, FiSettings, FiMail, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/admin/leads", label: "Leads", icon: FiUsers },
  { href: "/admin/pricing", label: "Pricing", icon: FiDollarSign },
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
  { href: "/admin/settings?tab=email-logs", label: "Email Logs", icon: FiMail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("mulchnow_user");
    if (!stored) {
      router.replace("/admin");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("mulchnow_user");
      router.replace("/admin");
    }
  }, [router]);

  // Don't render admin layout for the login page
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("mulchnow_user");
    router.replace("/admin");
  };

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return pathname === href.split("?")[0] && typeof window !== "undefined" && window.location.search.includes("tab=email-logs");
    }
    return pathname === href || (href === "/admin/settings" && pathname === "/admin/settings" && typeof window !== "undefined" && !window.location.search.includes("tab=email-logs"));
  };

  const pageTitle = navLinks.find((l) => pathname.startsWith(l.href.split("?")[0]) && l.href === pathname)?.label
    || navLinks.find((l) => pathname.startsWith(l.href.split("?")[0]))?.label
    || "Admin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-forest-950 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center">
              <FiHome className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Mulch Now</span>
              <span className="block text-xs text-forest-300">Admin Panel</span>
            </div>
          </Link>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-5 right-4 text-white/60 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${
                  active
                    ? "!bg-white/15 !text-white font-semibold"
                    : "text-forest-200 hover:!bg-white/10 hover:!text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-forest-700 flex items-center justify-center text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-forest-300 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-forest-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
