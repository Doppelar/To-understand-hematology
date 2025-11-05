import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const nodes = pgTable("nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  facilityName: text("facility_name"),
  career: text("career"),
  specialty: text("specialty"),
  region: text("region"),
  photoUrl: text("photo_url"),
  positionX: text("position_x").notNull().default("0"),
  positionY: text("position_y").notNull().default("0"),
});

export const edges = pgTable("edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull(),
  targetId: varchar("target_id").notNull(),
  label: text("label"),
});

export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  positionX: true,
  positionY: true,
});

export const insertEdgeSchema = createInsertSchema(edges).omit({
  id: true,
});

export type InsertNode = z.infer<typeof insertNodeSchema>;
export type Node = typeof nodes.$inferSelect;
export type InsertEdge = z.infer<typeof insertEdgeSchema>;
export type Edge = typeof edges.$inferSelect;
