"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { useRouter } from "nextjs-toploader/app";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/constants";
import TurnstileWidget from "@/components/turnstile-widget";

// Define the form input types
interface ISignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  "cf-turnstile-response": string;
}

// Define the validation schema using yup
const signupSchema = yup.object().shape({
  name: yup
    .string()
    .min(6, "Username must be at least 6 characters")
    .max(8, "Username cannot exceed 8 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .required("Username is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .matches(
      /@(gmail\.com)$/,
      "Only Gmail addresses are accepted (e.g., example@gmail.com)",
    )
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "You must agree to the terms and conditions")
    .required("You must agree to the terms and conditions"),
  "cf-turnstile-response": yup
    .string()
    .required("Please complete the verification"),
});

export default function SignUpForm() {
  const router = useRouter();
  const { signup } = useAuth({
    middleware: "guest",
    skipUserFetch: true, // Skip user fetch on signup page for faster load
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ISignupForm>({
    resolver: yupResolver(signupSchema),
    mode: "onChange", // Validate on change for better UX
  });

  const onSubmit: SubmitHandler<ISignupForm> = async (data) => {
    try {
      await signup({ ...data, password_confirmation: data.confirmPassword });
      toast.success("Registration successful! Redirecting to login...");
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push(Constants.Routes.login);
      }, 1500);
    } catch (error) {
      console.error(error);
      let message = "An error occurred";
      if (isAxiosError(error)) {
        message = error.response?.data.message || message;
      }
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Background Illustration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <div className="absolute bottom-0 left-0 top-0 flex w-1/2 items-center justify-center">
          <img
            src="/images/illustrations/auth-girl.png"
            className="max-h-[600px] max-w-full object-contain"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Form - Centered */}
      <div className="relative z-10 w-full max-w-lg px-8">
        {/* Logo - Top center */}
        <div className="mb-12 text-center">
          <Link
            href={Constants.Routes.nettrom.index}
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-500">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-semibold text-white">MangaDex</span>
          </Link>
        </div>

        {/* Form Panel */}
        <div className="rounded-lg border-t-4 border-orange-500 bg-neutral-800 p-8">
          <h1 className="mb-2 text-3xl font-semibold text-white">Register</h1>
          <p className="mb-6 text-sm text-orange-500">* Required fields</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-white">
                Username <span className="text-orange-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`w-full rounded border bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-0 ${
                  errors.name ? "border-red-500" : "border-orange-500"
                }`}
                placeholder="6-8 characters, letters, numbers, underscores only"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
              {!errors.name && watch("name") && (
                <p className="mt-1 text-xs text-gray-400">
                  {watch("name")?.length || 0}/8 characters
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-white"
              >
                Password <span className="text-orange-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                className={`w-full rounded border bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-0 ${
                  errors.password ? "border-red-500" : "border-orange-500"
                }`}
                placeholder="At least 8 characters with uppercase, lowercase, number, and special character"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
              {!errors.password && watch("password") && (
                <div className="mt-1 space-y-1 text-xs text-gray-400">
                  <p>Password requirements:</p>
                  <ul className="list-inside list-disc space-y-0.5">
                    <li
                      className={
                        watch("password")?.length >= 8 ? "text-green-400" : ""
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(watch("password") || "")
                          ? "text-green-400"
                          : ""
                      }
                    >
                      One uppercase letter
                    </li>
                    <li
                      className={
                        /[a-z]/.test(watch("password") || "")
                          ? "text-green-400"
                          : ""
                      }
                    >
                      One lowercase letter
                    </li>
                    <li
                      className={
                        /[0-9]/.test(watch("password") || "")
                          ? "text-green-400"
                          : ""
                      }
                    >
                      One number
                    </li>
                    <li
                      className={
                        /[^A-Za-z0-9]/.test(watch("password") || "")
                          ? "text-green-400"
                          : ""
                      }
                    >
                      One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm text-white"
              >
                Confirm password <span className="text-orange-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full rounded border bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-0 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : watch("confirmPassword") &&
                        watch("confirmPassword") === watch("password")
                      ? "border-green-500"
                      : "border-orange-500"
                }`}
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
              {!errors.confirmPassword &&
                watch("confirmPassword") &&
                watch("confirmPassword") === watch("password") && (
                  <p className="mt-1 text-sm text-green-400">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-white">
                Email <span className="text-orange-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`w-full rounded border bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-0 ${
                  errors.email ? "border-red-500" : "border-orange-500"
                }`}
                placeholder="example@gmail.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
              {!errors.email && watch("email") && (
                <p className="mt-1 text-xs text-gray-400">
                  Only Gmail addresses are accepted
                </p>
              )}
            </div>

            {/* Accept Terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  className="mt-1 h-4 w-4 rounded border-orange-500 bg-neutral-900 text-orange-500 focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm text-white">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-orange-500 underline hover:text-orange-400"
                    target="_blank"
                  >
                    Terms and Conditions
                  </Link>
                  <span className="text-orange-500"> *</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* Turnstile */}
            <div>
              <TurnstileWidget
                onVerify={(token) => setValue("cf-turnstile-response", token)}
              />
              {errors["cf-turnstile-response"] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors["cf-turnstile-response"].message}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full rounded bg-orange-500 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href={Constants.Routes.login}
                className="text-sm text-white no-underline transition-colors hover:text-orange-400"
              >
                &lt;&lt; Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
