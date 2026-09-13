import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  region: text("region").notNull(),
  icp: text("icp").notNull(),
  question: text("question").notNull(),
  score: integer("score").notNull().default(50),
  demand: integer("demand").notNull().default(50),
  saturation: integer("saturation").notNull().default(50),
  readiness: integer("readiness").notNull().default(50),
  status: text("status").notNull().default("ready"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_projects_owner_updated").on(table.ownerId, table.updatedAt)]);

export const findings = sqliteTable("findings", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sourceLabel: text("source_label").notNull(),
  confidence: text("confidence").notNull(),
  metric: text("metric").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_findings_project_created").on(table.projectId, table.createdAt)]);
