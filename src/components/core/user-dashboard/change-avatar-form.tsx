import { AppApi } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { Utils } from "@/utils";
import { useState } from "react";
import { toast } from "react-toastify";

export default function AvatarUpload() {
  const { mutate } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError("Image size must be less than 1MB.");
        setImage(null);
        setPreview(null);
        return;
      }
      setError("");
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    try {
      await AppApi.User.changeAvatar(image);
      toast.success("Avatar updated successfully.");
      await mutate();
    } catch (error) {
      Utils.Error.handleError(error);
    }
  };

  return (
    <div className="mt-5 rounded-md bg-white p-6 shadow dark:bg-slate-900 dark:shadow-gray-800">
      <h6 className="mb-4 text-lg font-semibold">Change Avatar</h6>
      <div>
        <label className="form-label font-medium" htmlFor="avatar_url">
          Upload Image : <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            id="avatar-upload"
          />
          <div className="w-full rounded border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-indigo-400">
            <div className="flex flex-col items-center">
              <svg
                className="mb-2 h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600">
                {image ? image.name : "Click to select an image"}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, GIF up to 1MB
              </p>
            </div>
          </div>
        </div>
        {error && <p className="mt-2 text-red-600">{error}</p>}
        {preview && (
          <img src={preview} className="mt-2 h-20 w-20 rounded" alt="" />
        )}
        <button
          disabled={!image}
          onClick={handleUpload}
          className="mt-5 inline-block rounded-md border border-indigo-600 bg-indigo-600 px-5 py-2 text-center align-middle text-base font-semibold tracking-wide text-white duration-500 hover:border-indigo-700 hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
      <div className="mt-5">
        <div className="font-bold">Notice:</div>
        <ul>
          <li>- Image size must be less than 1MB.</li>
          <li>- Posting sensitive images will result in permanent ban.</li>
        </ul>
      </div>
    </div>
  );
}
