-- AlterTable
ALTER TABLE "partner_applications" ADD COLUMN "phone_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN "position" TEXT NOT NULL DEFAULT '',
ADD COLUMN "business_details" TEXT NOT NULL DEFAULT '',
ADD COLUMN "office_photos" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN "personal_photo" TEXT NOT NULL DEFAULT '',
ADD COLUMN "id_card_photo" TEXT NOT NULL DEFAULT '',
ADD COLUMN "agreed_to_terms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "agreed_to_privacy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "agreed_to_nda" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "nda_agreed_date" TIMESTAMP(3),
ADD COLUMN "rejection_reason" TEXT,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
