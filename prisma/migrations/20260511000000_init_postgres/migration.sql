-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "stockNumber" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "bodyStyle" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "engine" TEXT,
    "transmission" TEXT,
    "drivetrain" TEXT,
    "fuelType" TEXT,
    "cityMpg" INTEGER,
    "highwayMpg" INTEGER,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "mileage" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "msrp" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'available',
    "headline" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT,
    "accidentFree" BOOLEAN NOT NULL DEFAULT true,
    "oneOwner" BOOLEAN NOT NULL DEFAULT false,
    "serviceRecords" BOOLEAN NOT NULL DEFAULT false,
    "carfaxUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "vehicleId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "payload" TEXT,
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyndicationRun" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "vehicleCount" INTEGER NOT NULL DEFAULT 0,
    "filePath" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "SyndicationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyndicationItem" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,

    CONSTRAINT "SyndicationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_stockNumber_key" ON "Vehicle"("stockNumber");

-- CreateIndex
CREATE INDEX "Vehicle_status_createdAt_idx" ON "Vehicle"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Vehicle_make_model_year_idx" ON "Vehicle"("make", "model", "year");

-- CreateIndex
CREATE INDEX "Photo_vehicleId_position_idx" ON "Photo"("vehicleId", "position");

-- CreateIndex
CREATE INDEX "Lead_type_status_createdAt_idx" ON "Lead"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SyndicationItem_runId_idx" ON "SyndicationItem"("runId");

-- CreateIndex
CREATE INDEX "SyndicationItem_vehicleId_idx" ON "SyndicationItem"("vehicleId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyndicationItem" ADD CONSTRAINT "SyndicationItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "SyndicationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyndicationItem" ADD CONSTRAINT "SyndicationItem_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

