/*
  Warnings:

  - A unique constraint covering the columns `[columnId,position]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Task_columnId_position_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Task_columnId_position_key" ON "Task"("columnId", "position");
