import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Import config
import { queryClient } from "./config/queryClient.config";

// Import auth components
import Login from "./Components/Auth/Login";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import ResetPassword from "./Components/Auth/ResetPassword";
import SignUp from "./Components/Auth/SignUp";

// Import dashboard components
import Dashboard from "./Components/Dashboard/Dashboard";
import Overview from "./Components/Dashboard/Overview";
import Accounts from "./Components/Dashboard/Accounts";
import Settings from "./Components/Dashboard/Settings";

// Import utility components
import ProtectedRoute from "./Components/Common/ProtectedRoute";
import Transactions from './Components/Dashboard/Transactions'
import Beneficiaries from "./Components/Dashboard/Beneficiaries";
import Profile from "./Components/Dashboard/Profile";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* Dashboard sub-routes - Note: these are relative paths */}
            <Route index element={<Overview />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="payments" element={<Accounts />} />
            <Route path="beneficiaries" element={<Beneficiaries />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />

      {/* React Query DevTools (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;