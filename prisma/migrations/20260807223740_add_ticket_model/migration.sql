-- CreateTable: tickets
-- Maps to Prisma model Ticket (@@map("tickets"))
-- userId FK references the "User" model mapped to "users" table
CREATE TABLE IF NOT EXISTS "tickets" (
    "id"           TEXT         NOT NULL,
    "customerName" TEXT         NOT NULL,
    "device"       TEXT         NOT NULL,
    "issueType"    TEXT         NOT NULL,
    "status"       TEXT         NOT NULL DEFAULT 'open',
    "quotedPrice"  DECIMAL(10,2) NOT NULL,
    "tax"          DECIMAL(10,2) NOT NULL,
    "discount"     DECIMAL(10,2) NOT NULL,
    "total"        DECIMAL(10,2) NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId"       INTEGER      NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- Rename the "User" table to "users" to match @@map("users")
-- Only rename if "User" exists and "users" doesn't yet
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'User'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    ALTER TABLE "User" RENAME TO "users";
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tickets_userId_idx" ON "tickets"("userId");

-- AddForeignKey (only if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tickets_userId_fkey'
  ) THEN
    ALTER TABLE "tickets"
      ADD CONSTRAINT "tickets_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
