import { z } from "zod";

// Article validation schemas
export const createArticleSchema = z.object({
  titleEn: z.string().min(1, "English title is required").max(255),
  titleAr: z.string().min(1, "Arabic title is required").max(255),
  author: z.string().min(1, "Author is required").max(255),
  descriptionEn: z.string().default(""),
  descriptionAr: z.string().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  keywordsEn: z.array(z.string()).optional(),
  keywordsAr: z.array(z.string()).optional(),
  contentEn: z.any(), // JSONContent from TipTap
  contentAr: z.any(), // JSONContent from TipTap
  contentSearchEn: z.string().default(""),
  contentSearchAr: z.string().default(""),
  slugEn: z.string().min(1).max(255),
  slugAr: z.string().min(1).max(255),
  coverImage: z.string().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
  lang: z.enum(["en", "ar"]).optional(),
});

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.url("Invalid image URL"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  liveUrl: z.url("Invalid live URL").optional().or(z.literal("")),
  sourceCodeUrl: z.url("Invalid source code URL").optional().or(z.literal("")),
  playStoreUrl: z.url("Invalid Play Store URL").optional().or(z.literal("")),
  appStoreUrl: z.url("Invalid App Store URL").optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  technology: z.string().optional(),
  search: z.string().optional(),
});

// Skill validation schemas
export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(255),
  percentage: z.coerce.number().int().min(0, "Percentage must be at least 0").max(100, "Percentage must be at most 100"),
  category: z.enum(["Proficient", "Familiar"]),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export const updateSkillSchema = createSkillSchema.partial();

// Education validation schemas
export const createEducationSchema = z.object({
  institution: z.string().min(1, "Institution is required").max(255),
  degree: z.string().min(1, "Degree is required").max(255),
  field: z.string().min(1, "Field is required").max(255),
  startDate: z.string().min(1, "Start date is required").max(50),
  endDate: z.string().min(1, "End date is required").max(50),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export const updateEducationSchema = createEducationSchema.partial();

// Experience validation schemas
export const createExperienceSchema = z.object({
  company: z.string().min(1, "Company is required").max(255),
  position: z.string().min(1, "Position is required").max(255),
  location: z.string().min(1, "Location is required").max(255),
  startDate: z.string().min(1, "Start date is required").max(50),
  endDate: z.string().min(1, "End date is required").max(50),
  responsibilities: z.array(z.string().min(1)).min(1, "At least one responsibility is required"),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
});

export const updateExperienceSchema = createExperienceSchema.partial();

// Profile validation schemas
export const updateProfileSchema = z.object({
  headline: z.string().max(255).optional(),
  bioEn: z.string().optional(),
  bioAr: z.string().optional(),
  aboutEn: z.string().optional(),
  aboutAr: z.string().optional(),
  happyClients: z.coerce.number().int().nonnegative().optional(),
  projectsCompleted: z.coerce.number().int().nonnegative().optional(),
  yearsOfExperience: z.coerce.number().int().nonnegative().optional(),
  resumeUrl: z.url("Invalid resume URL").optional().or(z.literal("")),
  contactEmail: z.email("Invalid email").optional().or(z.literal("")),
  heroImageUrl: z.url("Invalid image URL").optional().or(z.literal("")),
});

// User validation schemas
export const createUserSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  folder: z.string().optional().default("uploads"),
});

// Generic ID param schema
export const idParamSchema = z.object({
  id: z.uuid("Invalid ID format"),
});

// Slug param schema
export const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

// Type exports
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleQueryInput = z.infer<typeof articleQuerySchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;