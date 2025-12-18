import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import { useProfileData } from "../../hooks/useProfile";
import { getTimeBasedGreeting } from "../../utils/timeGreeting";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get profile data from global state
  const {
    firstName,
    lastName,
    customerType,
    customerTypeCode,
    businessName,
    isLoading: profileLoading,
    profile,
  } = useProfileData();

  // Fallback to localStorage if profile is still loading
  const fallbackUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userFirstName =
    customerTypeCode === "Business"
      ? businessName || fallbackUserData.businessName || "Business"
      : firstName || fallbackUserData.firstName || "User";
  const userType = customerType || "Personal";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      exact: true,
    },
    // {
    //   name: "Accounts",
    //   href: "/dashboard/accounts",
    //   icon: CreditCardIcon,
    //   iconSolid: CreditCardIconSolid,
    // },
    // {
    //   name: "Virtual Accounts",
    //   href: "/dashboard/virtual-accounts",
    //   icon: BanknotesIcon,
    //   iconSolid: BanknotesIconSolid,
    // },
    {
      name: "Transactions",
      href: "/dashboard/transactions",
      icon: ArrowsRightLeftIcon,
      iconSolid: ArrowsRightLeftIconSolid,
    },
    {
      name: "Beneficiaries",
      href: "/dashboard/beneficiaries",
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
    },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    sessionStorage.clear();

    // Navigate to login
    navigate("/login");
  };

  const handleNavigation = (href) => {
    // Close sidebar on mobile
    setSidebarOpen(false);
    // Navigate to the route
    navigate(href);
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center space-x-1">
              <img
                src="https://res.cloudinary.com/dnovlrekd/image/upload/v1766038036/ChatGPT_Image_Dec_17_2025_11_53_49_AM_zyw4jw.png"
                alt=""
                className="w-[100px] h-[80px]"
              />
              <div>
                <div className="text-md font-semibold text-slate-900">
                  Nexus
                </div>
                <div className="text-xs text-slate-500">Online Banking</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
              Menu
            </div>
            {navigation.map((item) => {
              const active = isActive(item);
              const IconComponent = active ? item.iconSolid : item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <IconComponent
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      active ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-slate-200">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {userFirstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {userFirstName}
                </div>
                <div className="text-xs text-slate-500">{userType}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Search bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-80 pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search transactions, accounts..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Account type toggle */}

              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <BellIcon className="h-6 w-6" />
              </button>

              {/* User profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {getTimeBasedGreeting()}, {userFirstName}
                  </div>
                  <div className="text-xs text-slate-500">{userType}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {userFirstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Force re-render on route changes */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
