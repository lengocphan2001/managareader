import useSWR from "swr";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "nextjs-toploader/app";

import { axios } from "@/api/core";
import { GetUserResponse } from "@/types";
import { Constants } from "@/constants";
import { AppApi } from "@/api";

import { useCookies } from "./useCookies";

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
  redirectIfNotAuthenticated,
}: {
  middleware?: string;
  redirectIfAuthenticated?: string;
  redirectIfNotAuthenticated?: string;
} = {}) => {
  const router = useRouter();

  const userIdValues = useCookies<number>("userId", 0, 0, {
    daysUntilExpiration: 1,
  });

  const { data: user, mutate } = useSWR("/api/user", async () => {
    try {
      const { data } = await axios.get<GetUserResponse>("/api/user");
      if (data?.user) {
        userIdValues.setState(data.user.id);
        return data.user;
      } else {
        userIdValues.resetState();
        return null;
      }
    } catch (error: any) {
      // If 401 (unauthorized), user is not logged in
      if (error?.response?.status === 401) {
        userIdValues.resetState();
        return null;
      }
      // For other errors, still return null but don't reset state
      return null;
    }
  }, {
    // Don't retry on 401 errors
    shouldRetryOnError: (error) => {
      return error?.response?.status !== 401;
    },
    // Don't fetch on focus if we got 401
    revalidateOnFocus: false,
  });

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const signup = async ({
    ...props
  }: {
    email: string;
    password: string;
    name: string;
    password_confirmation: string;
    "cf-turnstile-response": string;
  }) => {
    await csrf();

    const response = await axios.post("/api/auth/register", props);

    // Store token in localStorage for Authorization header
    if (response.data?.user && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    await mutate();
  };

  const login = async ({
    ...props
  }: {
    email: string;
    password: string;
    remember: boolean;
    "cf-turnstile-response": string;
  }) => {
    await csrf();

    const response = await axios({
      method: "POST",
      url: "/api/auth/login",
      data: props,
    });

    // Store token in localStorage for Authorization header
    if (response.data?.user && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    await mutate();
  };

  const forgotPassword = async (data: {
    email: string;
    "cf-turnstile-response": string;
  }) => {
    await csrf();

    try {
      await axios.post("/api/auth/forgot-password", data);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async ({
    ...props
  }: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  }) => {
    await csrf();

    await axios.post("/api/auth/reset-password", { ...props });

    router.push(Constants.Routes.login);
  };

  const resendEmailVerification = async (data: {
    "cf-turnstile-response": string;
  }) => {
    await axios.post("/api/auth/resend-verification", data);
  };

  const logout = useCallback(async () => {
    await axios.post("/api/auth/logout");

    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }

    toast("Logged out successfully");

    await mutate();
  }, [mutate]);

  const changePassword = useCallback(
    async (data: {
      oldPassword: string;
      password: string;
      confirmPassword: string;
    }) => {
      await AppApi.User.changePassword({
        current_password: data.oldPassword,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
      await mutate();
    },
    [mutate],
  );

  useEffect(() => {
    if (middleware === "guest" && user) {
      console.log(
        middleware,
        user,
        redirectIfAuthenticated,
        redirectIfNotAuthenticated,
      );
      // debugger;
      toast("Logged in successfully, redirecting...");
      router.push(redirectIfAuthenticated || Constants.Routes.nettrom.index);
    }

    if (middleware === "auth" && user === null) {
      router.push(redirectIfNotAuthenticated || Constants.Routes.login);
    }
  }, [!!user, middleware, redirectIfAuthenticated, redirectIfNotAuthenticated]);

  return {
    user,
    signup,
    login,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    logout,
    changePassword,
    mutate,
  };
};
