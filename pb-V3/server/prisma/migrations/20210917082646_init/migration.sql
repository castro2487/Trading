-- CreateEnum
CREATE TYPE "PortfolioType" AS ENUM ('REAL', 'SIMULATED', 'IMPORTED', 'UNAUTHENTICATED');

-- CreateEnum
CREATE TYPE "PositionType" AS ENUM ('OPTION', 'FUTURE');

-- CreateEnum
CREATE TYPE "PositionDirection" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL,
    "platformAccountId" INTEGER,

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Position" (
    "instrument" TEXT NOT NULL,
    "direction" "PositionDirection" NOT NULL,
    "uuid" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "averagePrice" DOUBLE PRECISION NOT NULL,
    "positionType" "PositionType" NOT NULL,
    "portfolioUuid" TEXT,

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Account" (
    "uuid" TEXT NOT NULL,
    "accountPlatformId" INTEGER,
    "userUuid" TEXT,

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equity" DOUBLE PRECISION NOT NULL,
    "portfolioType" "PortfolioType" NOT NULL,
    "accountUuid" TEXT,

    PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.platformAccountId_unique" ON "User"("platformAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account.accountPlatformId_unique" ON "Account"("accountPlatformId");

-- AddForeignKey
ALTER TABLE "Position" ADD FOREIGN KEY ("portfolioUuid") REFERENCES "Portfolio"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD FOREIGN KEY ("accountUuid") REFERENCES "Account"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
