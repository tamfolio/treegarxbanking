import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import IndividualSignUp from "./IndividualSignUp.jsx";
import CorporateSignUp from "./CorporateSignUp.jsx";

const SignUp = () => {
  const [selectedType, setSelectedType] = useState(null);

  if (selectedType === "individual") {
    return <IndividualSignUp onBack={() => setSelectedType(null)} />;
  }

  if (selectedType === "corporate") {
    return <CorporateSignUp onBack={() => setSelectedType(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-blue-50/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-100/30 to-blue-100/20 rounded-full animate-pulse delay-1000"></div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8">
          {/* Back Button */}
          <Link
            to="/login"
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to sign in</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-1">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dnovlrekd/image/upload/v1766038036/ChatGPT_Image_Dec_17_2025_11_53_49_AM_zyw4jw.png"
                    alt=""
                    className="w-[150px] h-[100px]"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Create an account
            </h1>
            <p className="text-slate-500 text-base">
              Choose your account type to get started
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="space-y-4">
            {/* Individual Account */}
            <button
              onClick={() => setSelectedType("individual")}
              className="w-full p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    Individual Account
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Personal trading and investment account for individual users
                  </p>
                </div>
                <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Corporate Account */}
            <button
              onClick={() => setSelectedType("corporate")}
              className="w-full p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    Corporate Account
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Business account for companies and organizations
                  </p>
                </div>
                <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Already have account */}
          <div className="text-center text-sm text-slate-600 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Support Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-20">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SignUp;
