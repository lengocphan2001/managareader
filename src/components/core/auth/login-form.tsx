"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { toast } from "react-toastify";

import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/constants";
import dynamic from "next/dynamic";
import { Utils } from "@/utils";

// Lazy load TurnstileWidget to reduce initial bundle
const TurnstileWidget = dynamic(() => import("@/components/turnstile-widget"), {
  ssr: false,
});

// Define the form input types
interface ILoginForm {
  email: string;
  password: string;
  remember: boolean;
  "cf-turnstile-response": string;
}

// Define the validation schema using yup
const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Please enter email"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Please enter password"),
  remember: yup.boolean().required(),
  "cf-turnstile-response": yup
    .string()
    .required("Please verify you are not a robot"),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login } = useAuth({
    middleware: "guest",
    redirectIfAuthenticated:
      searchParams.get("redirectUrl") || Constants.Routes.nettrom.index,
    skipUserFetch: true, // Skip user fetch on login page for faster load
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ILoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
      "cf-turnstile-response": "",
    },
  });

  const onSubmit: SubmitHandler<ILoginForm> = async (data) => {
    try {
      await login(data);
      // Redirect will be handled by useAuth useEffect, but we can also redirect immediately
      const redirectUrl = searchParams.get("redirectUrl") || Constants.Routes.nettrom.index;
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } catch (error) {
      Utils.Error.handleError(error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Illustration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
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
      <div className="relative z-2 w-full max-w-lg px-8">
        {/* Logo - Top center */}
        <div className="mb-12 text-center">
          <Link href={Constants.Routes.nettrom.index} className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-white text-2xl font-semibold">MangaDex</span>
          </Link>
        </div>

          {/* Form Panel */}
          <div className="bg-neutral-800 rounded-lg border-t-4 border-orange-500 p-8">
            <h1 className="text-white text-2xl font-semibold mb-6">
              Sign in to your account
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username or email */}
              <div>
                <label htmlFor="email" className="block text-white text-sm mb-2">
                  Username or email
                </label>
                <input
                  id="email"
                  type="text"
                  className="w-full bg-neutral-900 border border-orange-500 rounded px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-0"
                  placeholder=""
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-white text-sm mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder=""
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-orange-500 focus:ring-0 focus:ring-offset-0"
                    {...register("remember")}
                  />
                  <label htmlFor="remember" className="ml-2 text-white text-sm">
                    Remember me
                  </label>
                </div>
                <Link
                  href={Constants.Routes.forgotPassword}
                  className="text-orange-500 text-sm no-underline hover:no-underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Turnstile */}
              <div>
                <TurnstileWidget
                  onVerify={(token) => setValue("cf-turnstile-response", token)}
                />
                {errors["cf-turnstile-response"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["cf-turnstile-response"].message}
                  </p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>

              {/* New user */}
              <div className="text-center pt-4 border-t border-neutral-700">
                <span className="text-white text-sm">New user? </span>
                <Link
                  href={Constants.Routes.signup}
                  className="text-orange-500 text-sm no-underline hover:no-underline"
                >
                  Register
                </Link>
              </div>
            </form>
          </div>
      </div>
    </div>
  );
}
