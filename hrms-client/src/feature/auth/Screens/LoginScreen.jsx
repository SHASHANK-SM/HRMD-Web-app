import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import loginImage from "../../../assets/loging-image.png";
import { logout, userLogin } from "../Slices/loginSlice";

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isEmployeeLogin = location.pathname === "/employee-signin";
  const isHrLogin = location.pathname === "/hr-signin";
  const [sessionReady, setSessionReady] = useState(false);

  const { loading, token, error, role } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(logout());
    setSessionReady(true);
  }, [dispatch, location.pathname]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      empId: "",
      password: "",
    },
  });

  // Redirect after successful login
  useEffect(() => {
    if (!sessionReady || !token || !role) return;

    const normalizedRole = String(role).toLowerCase().trim();

    if (normalizedRole === "hr") {
      navigate("/hr-dashboard", { replace: true });
    } else if (normalizedRole === "employee") {
      navigate("/employee-dashboard", { replace: true });
    }
  }, [sessionReady, token, role, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(userLogin(data)).unwrap();
    } catch (error) {
      // Error is already stored in Redux by loginSlice.
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-4 sm:py-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 px-1 sm:px-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                HRMS
              </h1>

              <p className="hidden sm:block text-xs text-slate-500">
                Human Resource Management System
              </p>
            </div>
          </div>

          {/* Secure Portal */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <LockKeyhole className="w-4 h-4" />
            <span>
              {isEmployeeLogin
                ? "Secure Employee Portal"
                : isHrLogin
                  ? "Secure HR Workspace"
                  : "Secure HRMS Portal"}
            </span>
          </div>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ================= LEFT SECTION ================= */}
            <div className="hidden lg:flex relative bg-blue-600 overflow-hidden items-center justify-center p-6 xl:p-10">
              {/* Decorative circles */}
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500 opacity-40" />

              <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-blue-700 opacity-50" />

              <div className="relative z-10 text-center max-w-md">
                {/* Illustration */}
                <div className="mb-4">
                  <img
                    src={loginImage}
                    alt="HRMS employee"
                    className="w-full max-w-[300px] xl:max-w-[340px] mx-auto drop-shadow-2xl"
                  />
                </div>

                {/* Heading */}
                <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-2">
                  Everything you need,
                  <br />
                  all in one place.
                </h2>

                <p className="text-sm xl:text-base text-blue-100 leading-relaxed px-4">
                  Manage attendance, leaves, payroll and employee information
                  through one simple and secure platform.
                </p>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span className="w-2 h-2 rounded-full bg-blue-300" />
                  <span className="w-2 h-2 rounded-full bg-blue-300" />
                </div>
              </div>
            </div>

            {/* ================= RIGHT SECTION ================= */}
            <div className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
              <div className="w-full max-w-md">
                {/* Welcome */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-2 tracking-wide">
                    WELCOME BACK
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {isEmployeeLogin
                      ? "Sign in to the employee portal"
                      : isHrLogin
                        ? "Sign in to the HR workspace"
                        : "Sign in to your account"}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
                    Enter your credentials to access your HRMS dashboard.
                  </p>
                </div>

                {/* ================= FORM ================= */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  {/* Employee ID */}
                  <div>
                    <label
                      htmlFor="empId"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Employee ID
                    </label>

                    <input
                      id="empId"
                      type="text"
                      placeholder="Enter your employee ID"
                      autoComplete="username"
                      disabled={loading}
                      {...register("empId", {
                        required: "Employee ID is required",
                        minLength: {
                          value: 4,
                          message: "Employee ID must be at least 4 characters",
                        },
                      })}
                      className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                        errors.empId
                          ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />

                    {errors.empId && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.empId.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className={`w-full h-12 px-4 pr-12 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                          errors.password
                            ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      />

                      {/* Show/Hide Password */}
                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* API Error */}
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Signup Link */}
                <div className="mt-5 text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link
                      to={isEmployeeLogin ? "/employee-signup" : "/hr-signup"}
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      {isEmployeeLogin
                        ? "Create Employee Account"
                        : "Create Company / HR Account"}
                    </Link>
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-6 sm:mt-7 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    © {new Date().getFullYear()} HRMS. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-xs text-slate-400 mt-3">
          Secure access for authorized employees only
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
