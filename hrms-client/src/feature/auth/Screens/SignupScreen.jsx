import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import loginImage from "../../../assets/loging-image.png";
import { API } from "../../../Core/url";

/**
 * Employee Account Activation Screen.
 *
 * This screen is used by employees to activate their account
 * after HR has provisioned it (or for self-service registration).
 * The empId / email / designation are passed through the URL
 * and are read-only.
 *
 * It calls POST /auth/employee-register which is public.
 */
const SignupScreen = () => {
  const navigate = useNavigate();
  const { empId, email, designation } = useParams();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      empId: empId || "",
      email: email || "",
      designation: designation || "",
      firstName: "",
      lastName: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const submitForm = async (formData) => {
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        setApiError("Passwords do not match.");
        setLoading(false);
        return;
      }

      if (!formData.agree) {
        setApiError("You must accept the terms and conditions.");
        setLoading(false);
        return;
      }

      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        empId: formData.empId.trim(),
        jobTitle: formData.designation.trim() || undefined,
        password: formData.password,
      };

      const response = await API.post("/auth/employee-register", payload);

      setSuccessMessage(
        response?.data?.message || "Account created successfully.",
      );

      reset();

      setTimeout(() => {
        navigate("/employee-signin", { replace: true });
      }, 1200);
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-4 sm:py-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 px-1 sm:px-2">
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

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <LockKeyhole className="w-4 h-4" />
            <span>Secure Employee Portal</span>
          </div>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ================= LEFT SECTION ================= */}
            <div className="hidden lg:flex relative bg-blue-600 overflow-hidden items-center justify-center p-6 xl:p-10">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500 opacity-40" />
              <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-blue-700 opacity-50" />

              <div className="relative z-10 text-center max-w-md">
                <div className="mb-4">
                  <img
                    src={loginImage}
                    alt="HRMS employee"
                    className="w-full max-w-[300px] xl:max-w-[340px] mx-auto drop-shadow-2xl"
                  />
                </div>

                <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-2">
                  Activate your account,
                  <br />
                  start your journey.
                </h2>

                <p className="text-sm xl:text-base text-blue-100 leading-relaxed px-4">
                  Complete your employee profile and set your password to access
                  your HRMS dashboard.
                </p>

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
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-2 tracking-wide">
                    EMPLOYEE ACCOUNT ACTIVATION
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Create your account
                  </h2>

                  <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
                    Set your name and password to activate your employee
                    account.
                  </p>
                </div>

                {successMessage && (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-sm text-emerald-700">
                      {successMessage} Redirecting to login...
                    </p>
                  </div>
                )}

                {apiError && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-sm text-red-600">{apiError}</p>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(submitForm)}
                  className="space-y-4"
                  noValidate
                >
                  {/* Read-only: Employee ID */}
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
                      readOnly
                      disabled={loading}
                      {...register("empId")}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-100 text-sm sm:text-base text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Read-only: Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      readOnly
                      disabled={loading}
                      {...register("email")}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-100 text-sm sm:text-base text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Read-only: Designation */}
                  <div>
                    <label
                      htmlFor="designation"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Designation
                    </label>

                    <input
                      id="designation"
                      type="text"
                      readOnly
                      disabled={loading}
                      {...register("designation")}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-100 text-sm sm:text-base text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      autoComplete="given-name"
                      disabled={loading}
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: {
                          value: 3,
                          message: "First name must be at least 3 characters",
                        },
                      })}
                      className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                        errors.firstName
                          ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />

                    {errors.firstName && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name"
                      autoComplete="family-name"
                      disabled={loading}
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: {
                          value: 1,
                          message: "Last name must be at least 1 character",
                        },
                      })}
                      className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                        errors.lastName
                          ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />

                    {errors.lastName && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.lastName.message}
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
                      className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                        errors.mobile
                          ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />

                    {errors.mobile && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.mobile.message}
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

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Confirm Password
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      disabled={loading}
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full h-12 px-4 rounded-xl border bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${
                        errors.confirmPassword
                          ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />

                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={loading}
                        {...register("agree", {
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

                    {errors.agree && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.agree.message}
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
                        <span>Create Account</span>
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

        <p className="text-center text-xs text-slate-400 mt-3">
          Secure access for authorized employees only
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
