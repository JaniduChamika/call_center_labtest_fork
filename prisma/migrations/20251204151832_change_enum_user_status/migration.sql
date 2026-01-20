/*
  Warnings:

  - The values [pending_verification] on the enum `user_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "user_status_new" AS ENUM ('active', 'inactive', 'suspended', 'pending');
ALTER TABLE "public"."call_center_user" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "call_center_user" ALTER COLUMN "status" TYPE "user_status_new" USING ("status"::text::"user_status_new");
ALTER TYPE "user_status" RENAME TO "user_status_old";
ALTER TYPE "user_status_new" RENAME TO "user_status";
DROP TYPE "public"."user_status_old";
ALTER TABLE "call_center_user" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "call_center_user" ALTER COLUMN "status" SET DEFAULT 'pending';
