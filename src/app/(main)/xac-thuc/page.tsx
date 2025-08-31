import Iconify from "@/components/iconify";
import Buttons from "@/components/core/auth/verify-email-buttons";

export default function VerifyEmailPage() {
  return (
    <div>
      <section className="relative flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-800">
        <div className="container relative">
          <div className="justify-center md:flex">
            <div className="lg:w-2/5">
              <div className="relative overflow-hidden rounded-md bg-white shadow dark:bg-slate-900 dark:shadow-gray-700">
                <div className="bg-yellow-600 px-6 py-12 text-center">
                  <Iconify
                    className="mx-auto text-8xl text-white"
                    icon="uil:question-circle"
                  />
                  <h5 className="mt-2 text-xl font-semibold uppercase tracking-wide text-white">
                    Didn't receive the email?
                  </h5>
                </div>
                <div className="px-6 py-12 text-center">
                  <p className="text-slate-400">
                    Please check your email (including spam folder) to verify
                    your email and continue using TruyenDex! Usually the email
                    will be sent within 1 ~ 10 minutes after registration. If
                    you still don't receive it, please choose to resend below.
                  </p>
                  <p>
                    Note: Use your <b>current browser</b> to open the link
                    attached in the email!
                  </p>
                  <Buttons />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*end container*/}
      </section>
    </div>
  );
}
