import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const nodes = pgTable("nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  facilityName: text("facility_name"),
  position: text("position"),
  career: text("career"),
  specialty: text("specialty"),
  region: text("region"),
  photoUrl: text("photo_url"),
  graduationUniversity: text("graduation_university"),
  graduationYear: text("graduation_year"),
  appointmentDate: text("appointment_date"),
  retirementDate: text("retirement_date"),
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

export const societies = pgTable("societies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  description: text("description"),
});

export const conferences = pgTable("conferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  societyId: varchar("society_id").notNull(),
  year: text("year").notNull(),
  number: text("number"),
  title: text("title").notNull(),
  location: text("location"),
  president: text("president"),
  date: text("date"),
});

export const societyOfficials = pgTable("society_officials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  societyId: varchar("society_id").notNull(),
  nodeId: varchar("node_id").notNull(),
  position: text("position").notNull(),
  term: text("term"),
});

export const insertSocietySchema = createInsertSchema(societies).omit({
  id: true,
});

export const insertConferenceSchema = createInsertSchema(conferences).omit({
  id: true,
});

export const insertSocietyOfficialSchema = createInsertSchema(societyOfficials).omit({
  id: true,
});

export type InsertSociety = z.infer<typeof insertSocietySchema>;
export type Society = typeof societies.$inferSelect;
export type InsertConference = z.infer<typeof insertConferenceSchema>;
export type Conference = typeof conferences.$inferSelect;
export type InsertSocietyOfficial = z.infer<typeof insertSocietyOfficialSchema>;
export type SocietyOfficial = typeof societyOfficials.$inferSelect;
