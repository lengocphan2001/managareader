-- CreateTable
CREATE TABLE "library" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "series_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "site_name" TEXT NOT NULL DEFAULT 'MangaReader',
    "site_description" TEXT NOT NULL DEFAULT 'Your ultimate manga reading experience',
    "site_url" TEXT NOT NULL DEFAULT 'https://mangareader.com',
    "admin_email" TEXT NOT NULL DEFAULT 'admin@mangareader.com',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "primary_color" TEXT NOT NULL DEFAULT '#3B82F6',
    "logo_url" TEXT NOT NULL DEFAULT '/logo.png',
    "favicon_url" TEXT NOT NULL DEFAULT '/favicon.ico',
    "footer_logo_url" TEXT NOT NULL DEFAULT '/images/logo-footer.png',
    "enable_dark_mode" BOOLEAN NOT NULL DEFAULT true,
    "header_scripts" TEXT NOT NULL DEFAULT '',
    "footer_scripts" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_user_id_series_id_key" ON "library"("user_id", "series_id");

-- AddForeignKey
ALTER TABLE "library" ADD CONSTRAINT "library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
