import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
  Building2,
  User,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

import loginImage from "../../../assets/loging-image.png";
import { API } from "../../../Core/url";

const CompanyRegistrationScreen = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      companyName: "",
      companyAdress: "",
      empId: "",
      password: "",
      termsAndCondition: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        mobile: data.mobile.trim(),
        companyName: data.companyName.trim(),
        companyAdress: data.companyAdress?.trim() || "",
        empId: data.empId.trim(),
        password: data.password,
        termsAndCondition: data.termsAndCondition ? "accepted" : undefined,
      };

      const response = await API.post("/auth/new-company-reg", payload);

      setSuccessMessage(
        response?.data?.message ||
          "Company and HR account created successfully.",
      );

      setTimeout(() => {
        navigate("/hr-signin", { replace: true });
      }, 1500);
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          "Registration failed. Please check the entered information.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-4 sm:py-6">
      <div className="w-full max-w-7xl mx-auto">
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
            <span>Secure Company Onboarding</span>
          </div>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
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
                  Create your company,
                  <br />
                  onboard your HR.
                </h2>

                <p className="text-sm xl:text-base text-blue-100 leading-relaxed px-4">
                  Register your organization and create the HR administrator
                  account that will manage employees, attendance, leaves and
                  payroll.
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
              <div className="w-full max-w-xl">
                {/* Welcome */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-2 tracking-wide">
                    COMPANY / HR REGISTRATION
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Create Company & HR Account
                  </h2>

                  <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
                    Set up your organization and create the HR administrator
                    account.
                  </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-700">
                      {successMessage} Redirecting to login...
                    </p>
                  </div>
                )}

                {/* API Error */}
                {apiError && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-sm text-red-600">{apiError}</p>
                  </div>
                )}

                {/* ================= FORM ================= */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  {/* HR Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      HR Full Name
                    </label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        id="name"
                        type="text"
                        placeholder="Enter HR full name"
                        autoComplete="name"
                        disabled={loading}
                        {...register("name", {
                          required: "HR name is required",
                          minLength: {
                            value: 3,
                            message: "Name must be at least 3 characters",
                          },
                        })}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                          errors.name
                            ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      />
                    </div>

                    {errors.name && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        autoComplete="email"
                        disabled={loading}
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                          errors.email
                            ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Mobile Number
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        id="mobile"
                        type="tel"
                        placeholder="Enter mobile number"
                        autoComplete="tel"
                        disabled={loading}
                        {...register("mobile", {
                          required: "Mobile number is required",
                          minLength: {
                            value: 10,
                            message: "Mobile number must be at least 10 digits",
                          },
                        })}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                          errors.mobile
                            ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      />
                    </div>

                    {errors.mobile && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Company Name
                    </label>

                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      <input
                        id="companyName"
                        type="text"
                        placeholder="Enter company name"
                        autoComplete="organization"
                        disabled={loading}
                        {...register("companyName", {
                          required: "Company name is required",
                          minLength: {
                            value: 2,
                            message:
                              "Company name must be at least 2 characters",
                          },
                        })}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                          errors.companyName
                            ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      />
                    </div>

                    {errors.companyName && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* Company Address */}
                  <div>
                    <label
                      htmlFor="companyAdress"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Company Address
                    </label>

                    <textarea
                      id="companyAdress"
                      rows={2}
                      placeholder="Enter company address"
                      disabled={loading}
                      {...register("companyAdress", {
                        required: "Company address is required",
                      })}
                      className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 resize-none ${
                        errors.companyAdress
                          ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />

                    {errors.companyAdress && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.companyAdress.message}
                      </p>
                    )}
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label
                      htmlFor="empId"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      HR Employee ID
                    </label>

                    <input
                      id="empId"
                      type="text"
                      placeholder="Enter HR employee ID"
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
                        placeholder="Create a password"
                        autoComplete="new-password"
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

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={loading}
                        {...register("termsAndCondition", {
                          required: "You must accept the terms and conditions",
                        })}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span className="text-sm text-slate-600">
                        I agree to the{" "}
                        <span className="text-blue-600 font-medium">
                          Terms & Conditions
                        </span>{" "}
                        and{" "}
                        <span className="text-blue-600 font-medium">
                          Privacy Policy
                        </span>
                      </span>
                    </label>

                    {errors.termsAndCondition && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.termsAndCondition.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Company & HR Account</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 sm:mt-7 pt-4 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      Sign in
                    </Link>
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

export default CompanyRegistrationScreen;
