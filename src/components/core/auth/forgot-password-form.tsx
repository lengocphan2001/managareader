"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { toast } from "react-toastify";
import Link from "next/link";
import { isAxiosError } from "axios";

import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/constants";
import TurnstileWidget from "@/components/turnstile-widget";

interface IForgotPasswordForm {
  email: string;
  "cf-turnstile-response": string;
}

// Define the validation schema using yup
const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .matches(
      /@(gmail\.com)$/,
      "Only Gmail addresses are accepted (e.g., example@gmail.com)",
    )
    .required("Email is required"),
  "cf-turnstile-response": yup
    .string()
    .required("Please complete the verification"),
});

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth({ middleware: "guest" });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IForgotPasswordForm>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: "onChange", // Validate on change for better UX
  });

  const onSubmit: SubmitHandler<IForgotPasswordForm> = async (data) => {
    try {
      await forgotPassword(data);
      toast.success("Request sent successfully! Please check your email!");
    } catch (error) {
      console.error(error);
      let message = "Request failed. Please try again.";

      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;

        // Handle email not found or user doesn't exist
        if (
          errorMessage?.toLowerCase().includes("user") &&
          errorMessage?.toLowerCase().includes("not found")
        ) {
          setError("email", {
            type: "manual",
            message: "No account found with this email address",
          });
          return;
        }

        // Handle email already exists (shouldn't happen in forgot password, but handle it)
        if (
          errorMessage?.toLowerCase().includes("user already exists") ||
          errorMessage === "User already exists with this email"
        ) {
          setError("email", {
            type: "manual",
            message:
              "This email is already registered. Please use login instead.",
          });
          return;
        }

        message = errorMessage || message;
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
            <div className="43`` ` flex items-center justify-center rounded bg-orange-500">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-semibold text-white">MangaDex</span>
          </Link>
        </div>

        {/* Form Panel */}
        <div className="rounded-lg border-t-4 border-orange-500 bg-neutral-800 p-8">
          <h1 className="mb-2 text-3xl font-semibold text-white">
            Forgot Password
          </h1>
          <p className="mb-6 text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full rounded bg-orange-500 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Back to Login */}
            <div className="border-t border-neutral-700 pt-4 text-center">
              <span className="text-sm text-white">
                Remember your password?{" "}
              </span>
              <Link
                href={Constants.Routes.login}
                className="text-sm text-orange-500 no-underline transition-colors hover:text-orange-400"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
