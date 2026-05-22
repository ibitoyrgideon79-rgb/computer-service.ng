-- CreateTable
CREATE TABLE "partner_updates" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "image_data_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partner_updates_application_id_idx" ON "partner_updates"("application_id");

-- AddForeignKey
ALTER TABLE "partner_updates" ADD CONSTRAINT "partner_updates_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "partner_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
