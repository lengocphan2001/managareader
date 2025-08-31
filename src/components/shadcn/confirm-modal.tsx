"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-red-600";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
      default:
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

                 <div className="fixed inset-0 z-10 overflow-y-auto">
           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
             <Transition.Child
               as={Fragment}
               enter="ease-out duration-300"
               enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
               enterTo="opacity-100 translate-y-0 sm:scale-100"
               leave="ease-in duration-200"
               leaveFrom="opacity-100 translate-y-0 sm:scale-100"
               leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             >
               <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white px-6 pb-6 pt-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8 md:max-w-3xl lg:max-w-4xl">
                                 <div className="sm:flex sm:items-start">
                   <div className={`mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-16 sm:w-16`}>
                     <ExclamationTriangleIcon className={`h-8 w-8 ${getIconColor()}`} aria-hidden="true" />
                   </div>
                   <div className="mt-4 text-center sm:ml-6 sm:mt-0 sm:text-left">
                     <Dialog.Title as="h3" className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl">
                       {title}
                     </Dialog.Title>
                     <div className="mt-4">
                       <p className="text-base text-gray-600 sm:text-lg">
                         {message}
                       </p>
                     </div>
                   </div>
                 </div>
                                 <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse">
                   <button
                     type="button"
                     className={`inline-flex w-full justify-center rounded-lg px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl sm:ml-4 sm:w-auto ${getButtonColor()}`}
                     onClick={handleConfirm}
                   >
                     {confirmText}
                   </button>
                   <button
                     type="button"
                     className="mt-4 inline-flex w-full justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl sm:mt-0 sm:w-auto"
                     onClick={onClose}
                   >
                     {cancelText}
                   </button>
                 </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
