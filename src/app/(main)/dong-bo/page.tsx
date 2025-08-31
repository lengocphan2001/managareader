import SyncView from "@/components/core/sync";

export default function SyncPage() {
  return (
    <div>
      <section className="relative flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-800">
        <div className="container relative">
          <div className="justify-center md:flex">
            <div className="lg:w-2/5">
              <SyncView />
            </div>
          </div>
        </div>
        {/*end container*/}
      </section>
    </div>
  );
}
