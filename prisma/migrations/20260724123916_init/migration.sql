-- CreateEnum
CREATE TYPE "HazardType" AS ENUM ('FLOOD', 'DROUGHT', 'EXTREME_HEAT', 'STORM');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('WATCH', 'WARNING', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "WarningStatus" AS ENUM ('DRAFT', 'APPROVED', 'DISPATCHED');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('TELEGRAM', 'SIMULATED_SMS', 'SIMULATED_USSD', 'IN_APP');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConfirmationResponse" AS ENUM ('UNDERSTOOD', 'NEED_MORE_INFO');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HazardSignal" (
    "id" TEXT NOT NULL,
    "type" "HazardType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "locationId" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HazardSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL,
    "hazardSignalId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "literacyLevel" TEXT NOT NULL DEFAULT 'low',
    "status" "WarningStatus" NOT NULL DEFAULT 'DRAFT',
    "aiModel" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "dispatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "isSimulated" BOOLEAN NOT NULL DEFAULT true,
    "telegramChatId" TEXT,
    "preferredChannel" "Channel" NOT NULL DEFAULT 'SIMULATED_SMS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispatch" (
    "id" TEXT NOT NULL,
    "warningId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Confirmation" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "response" "ConfirmationResponse" NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeToConfirmSeconds" INTEGER NOT NULL,

    CONSTRAINT "Confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationSuggestion" (
    "id" TEXT NOT NULL,
    "warningId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "aiRationale" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscalationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_ward_key" ON "Location"("name", "ward");

-- CreateIndex
CREATE INDEX "HazardSignal_locationId_observedAt_idx" ON "HazardSignal"("locationId", "observedAt");

-- CreateIndex
CREATE INDEX "Warning_status_idx" ON "Warning"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_telegramChatId_key" ON "Recipient"("telegramChatId");

-- CreateIndex
CREATE INDEX "Recipient_locationId_idx" ON "Recipient"("locationId");

-- CreateIndex
CREATE INDEX "Dispatch_warningId_idx" ON "Dispatch"("warningId");

-- CreateIndex
CREATE INDEX "Dispatch_recipientId_idx" ON "Dispatch"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "Confirmation_dispatchId_key" ON "Confirmation"("dispatchId");

-- CreateIndex
CREATE INDEX "Confirmation_response_idx" ON "Confirmation"("response");

-- CreateIndex
CREATE INDEX "EscalationSuggestion_warningId_idx" ON "EscalationSuggestion"("warningId");

-- AddForeignKey
ALTER TABLE "HazardSignal" ADD CONSTRAINT "HazardSignal_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_hazardSignalId_fkey" FOREIGN KEY ("hazardSignalId") REFERENCES "HazardSignal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_warningId_fkey" FOREIGN KEY ("warningId") REFERENCES "Warning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Confirmation" ADD CONSTRAINT "Confirmation_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "Dispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationSuggestion" ADD CONSTRAINT "EscalationSuggestion_warningId_fkey" FOREIGN KEY ("warningId") REFERENCES "Warning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
