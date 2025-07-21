/*
  Warnings:

  - The values [PERSON] on the enum `ContactType` will be removed. If these variants are still used in the database, this will fail.
  - The values [HIRE] on the enum `InteractionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [BUSINESS] on the enum `RelationType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[contactId,entityId,role]` on the table `ContactRole` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,entityId,relation]` on the table `Relationship` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `addedById` on table `Contact` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `entityId` to the `ContactRole` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('BUSINESS', 'PROFESSIONAL', 'SERVICE', 'ORGANIZATION', 'OTHER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CARPENTER', 'PLUMBER', 'ELECTRICIAN', 'HOTEL', 'RESTAURANT', 'RETAIL', 'HEALTHCARE', 'EDUCATION', 'FINANCE', 'TRANSPORTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipStrength" AS ENUM ('WEAK', 'MODERATE', 'STRONG', 'TRUSTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ContactType_new" AS ENUM ('PERSONAL', 'BUSINESS');
ALTER TABLE "Contact" ALTER COLUMN "type" TYPE "ContactType_new" USING ("type"::text::"ContactType_new");
ALTER TYPE "ContactType" RENAME TO "ContactType_old";
ALTER TYPE "ContactType_new" RENAME TO "ContactType";
DROP TYPE "ContactType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InteractionType_new" AS ENUM ('CALL', 'EMAIL', 'MESSAGE', 'MEETING', 'TRANSACTION', 'REVIEW', 'RECOMMENDATION', 'OTHER');
ALTER TABLE "Interaction" ALTER COLUMN "type" TYPE "InteractionType_new" USING ("type"::text::"InteractionType_new");
ALTER TYPE "InteractionType" RENAME TO "InteractionType_old";
ALTER TYPE "InteractionType_new" RENAME TO "InteractionType";
DROP TYPE "InteractionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RelationType_new" AS ENUM ('FRIEND', 'FAMILY', 'COLLEAGUE', 'ACQUAINTANCE', 'SERVICE_PROVIDER', 'CLIENT', 'VENDOR', 'PARTNER', 'RECOMMENDED', 'HIRED', 'WORKED_WITH', 'OTHER');
ALTER TABLE "Relationship" ALTER COLUMN "relation" TYPE "RelationType_new" USING ("relation"::text::"RelationType_new");
ALTER TYPE "RelationType" RENAME TO "RelationType_old";
ALTER TYPE "RelationType_new" RENAME TO "RelationType";
DROP TYPE "RelationType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Visibility" ADD VALUE 'CONNECTIONS';
ALTER TYPE "Visibility" ADD VALUE 'CUSTOM';

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_addedById_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Relationship" DROP CONSTRAINT "Relationship_contactId_fkey";

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "address" JSONB,
ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "addedById" SET NOT NULL;

-- AlterTable
ALTER TABLE "ContactRole" ADD COLUMN     "department" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "relatedToId" TEXT,
ADD COLUMN     "relationshipId" TEXT,
ALTER COLUMN "contactId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN     "context" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "isReciprocal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "strength" "RelationshipStrength" NOT NULL DEFAULT 'WEAK',
ALTER COLUMN "contactId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GlobalEntity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EntityType" NOT NULL,
    "description" TEXT,
    "categories" "Category"[],
    "tags" TEXT[],
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" JSONB,
    "location" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContactEntityLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContactEntityLinks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "GlobalEntity_name_idx" ON "GlobalEntity"("name");

-- CreateIndex
CREATE INDEX "GlobalEntity_type_idx" ON "GlobalEntity"("type");

-- CreateIndex
CREATE INDEX "GlobalEntity_phone_idx" ON "GlobalEntity"("phone");

-- CreateIndex
CREATE INDEX "GlobalEntity_email_idx" ON "GlobalEntity"("email");

-- CreateIndex
CREATE INDEX "_ContactEntityLinks_B_index" ON "_ContactEntityLinks"("B");

-- CreateIndex
CREATE INDEX "Contact_name_idx" ON "Contact"("name");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");

-- CreateIndex
CREATE INDEX "Contact_addedById_idx" ON "Contact"("addedById");

-- CreateIndex
CREATE INDEX "ContactRole_contactId_idx" ON "ContactRole"("contactId");

-- CreateIndex
CREATE INDEX "ContactRole_entityId_idx" ON "ContactRole"("entityId");

-- CreateIndex
CREATE INDEX "ContactRole_role_idx" ON "ContactRole"("role");

-- CreateIndex
CREATE INDEX "ContactRole_isPrimary_idx" ON "ContactRole"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "ContactRole_contactId_entityId_role_key" ON "ContactRole"("contactId", "entityId", "role");

-- CreateIndex
CREATE INDEX "Interaction_userId_idx" ON "Interaction"("userId");

-- CreateIndex
CREATE INDEX "Interaction_contactId_idx" ON "Interaction"("contactId");

-- CreateIndex
CREATE INDEX "Interaction_entityId_idx" ON "Interaction"("entityId");

-- CreateIndex
CREATE INDEX "Interaction_timestamp_idx" ON "Interaction"("timestamp");

-- CreateIndex
CREATE INDEX "Interaction_type_idx" ON "Interaction"("type");

-- CreateIndex
CREATE INDEX "Relationship_userId_idx" ON "Relationship"("userId");

-- CreateIndex
CREATE INDEX "Relationship_contactId_idx" ON "Relationship"("contactId");

-- CreateIndex
CREATE INDEX "Relationship_entityId_idx" ON "Relationship"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_userId_entityId_relation_key" ON "Relationship"("userId", "entityId", "relation");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "GlobalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "GlobalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_relatedToId_fkey" FOREIGN KEY ("relatedToId") REFERENCES "Interaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactRole" ADD CONSTRAINT "ContactRole_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "GlobalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactEntityLinks" ADD CONSTRAINT "_ContactEntityLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactEntityLinks" ADD CONSTRAINT "_ContactEntityLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "GlobalEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
