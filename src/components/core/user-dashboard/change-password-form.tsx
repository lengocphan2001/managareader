import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { toast } from "react-toastify";

import Iconify from "@/components/iconify";
import { useAuth } from "@/hooks/useAuth";
import { Utils } from "@/utils";
import { yupResolver } from "@hookform/resolvers/yup";

const changePasswordSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Please enter your current password"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .notOneOf(
      [yup.ref("oldPassword")],
      "New password cannot be the same as current password",
    )
    .required("Please enter a password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password confirmation does not match")
    .required("Please confirm your password"),
});

interface IChangePasswordForm {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export default function PasswordUpdate() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IChangePasswordForm>({
    resolver: yupResolver(changePasswordSchema),
  });

  const { changePassword } = useAuth();

  const onSubmit: SubmitHandler<IChangePasswordForm> = async (data) => {
    try {
      await changePassword({
        ...data,
      });
      toast.success("Password updated successfully, please log in again");
    } catch (error) {
      Utils.Error.handleError(error);
    }
  };

  return (
    <div className="mt-5 rounded-md bg-white p-6 shadow dark:bg-slate-900 dark:shadow-gray-800">
      <h6 className="mb-4 text-lg font-semibold">Change Password</h6>
      <div>
        <label className="form-label font-medium">
          Current Password : <span className="text-red-600">*</span>
        </label>
        <div className="form-icon relative my-2">
          <Iconify
            icon="feather:key"
            className="absolute start-4 top-3 size-4"
          />
          <input
            type="password"
            className="form-input h-10 w-full rounded border border-gray-200 bg-transparent px-3 py-2 ps-12 outline-none focus:border-indigo-600 focus:ring-0 dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-600"
            placeholder="Current password"
            id="old-password"
            {...register("oldPassword")}
          />
        </div>
        {errors.oldPassword && (
          <p className="mt-2 text-red-600">{errors.oldPassword.message}</p>
        )}
        <label className="form-label mt-4 font-medium">
          New Password : <span className="text-red-600">*</span>
        </label>
        <div className="form-icon relative my-2">
          <Iconify
            icon="feather:key"
            className="absolute start-4 top-3 size-4"
          />
          <input
            type="password"
            className="form-input h-10 w-full rounded border border-gray-200 bg-transparent px-3 py-2 ps-12 outline-none focus:border-indigo-600 focus:ring-0 dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-600"
            placeholder="New password"
            id="new-password"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="mt-2 text-red-600">{errors.password.message}</p>
        )}
        <label className="form-label mt-4 font-medium">
          Confirm New Password : <span className="text-red-600">*</span>
        </label>
        <div className="form-icon relative my-2">
          <Iconify
            icon="feather:key"
            className="absolute start-4 top-3 size-4"
          />
          <input
            type="password"
            className="form-input h-10 w-full rounded border border-gray-200 bg-transparent px-3 py-2 ps-12 outline-none focus:border-indigo-600 focus:ring-0 dark:border-gray-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-600"
            placeholder="Confirm new password"
            id="confirm-password"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-red-600">{errors.confirmPassword.message}</p>
        )}
        <button
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          className="mt-5 inline-block rounded-md border border-indigo-600 bg-indigo-600 px-5 py-2 text-center align-middle text-base font-semibold tracking-wide text-white duration-500 hover:border-indigo-700 hover:bg-indigo-700"
        >
          {isSubmitting ? "Updating..." : "Save"}
        </button>
      </div>
    </div>
  );
}
