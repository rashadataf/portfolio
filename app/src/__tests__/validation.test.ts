import {
  createArticleSchema,
  updateArticleSchema,
  createProjectSchema,
  updateProjectSchema,
  loginSchema,
  updateProfileSchema,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("createArticleSchema", () => {
    it("validates a valid article", () => {
      const validArticle = {
        titleEn: "Test Article",
        titleAr: "مقال اختبار",
        author: "John Doe",
        descriptionEn: "Test description",
        descriptionAr: "وصف اختبار",
        status: "draft",
        keywordsEn: ["test", "article"],
        keywordsAr: ["اختبار", "مقال"],
        contentEn: { type: "doc", content: [] },
        contentAr: { type: "doc", content: [] },
        contentSearchEn: "test article",
        contentSearchAr: "مقال اختبار",
        slugEn: "test-article",
        slugAr: "مقال-اختبار",
        coverImage: "https://example.com/image.jpg",
      };

      const result = createArticleSchema.safeParse(validArticle);
      expect(result.success).toBe(true);
    });

    it("rejects article with missing required fields", () => {
      const invalidArticle = {
        titleEn: "",
        titleAr: "مقال اختبار",
        author: "John Doe",
      };

      const result = createArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((e) => e.path.includes("titleEn"))).toBe(true);
      }
    });

    it("rejects article with invalid status", () => {
      const invalidArticle = {
        titleEn: "Test Article",
        titleAr: "مقال اختبار",
        author: "John Doe",
        status: "invalid",
        contentEn: { type: "doc", content: [] },
        contentAr: { type: "doc", content: [] },
        slugEn: "test-article",
        slugAr: "مقال-اختبار",
      };

      const result = createArticleSchema.safeParse(invalidArticle);
      expect(result.success).toBe(false);
    });

    it("accepts article with any coverImage string (relative URLs allowed)", () => {
      const article = {
        titleEn: "Test Article",
        titleAr: "مقال اختبار",
        author: "John Doe",
        contentEn: { type: "doc", content: [] },
        contentAr: { type: "doc", content: [] },
        slugEn: "test-article",
        slugAr: "مقال-اختبار",
        coverImage: "/api/files/123_image.jpg",
      };

      const result = createArticleSchema.safeParse(article);
      expect(result.success).toBe(true);
    });
  });

  describe("updateArticleSchema", () => {
    it("allows partial updates", () => {
      const partialUpdate = {
        titleEn: "Updated Title",
      };

      const result = updateArticleSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe("createProjectSchema", () => {
    it("validates a valid project", () => {
      const validProject = {
        title: "Test Project",
        description: "A test project",
        imageUrl: "https://example.com/image.jpg",
        technologies: ["React", "TypeScript"],
        liveUrl: "https://example.com",
        sourceCodeUrl: "https://github.com/user/repo",
        displayOrder: 1,
      };

      const result = createProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("rejects project with empty technologies array", () => {
      const invalidProject = {
        title: "Test Project",
        description: "A test project",
        imageUrl: "https://example.com/image.jpg",
        technologies: [],
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    it("rejects project with invalid URLs", () => {
      const invalidProject = {
        title: "Test Project",
        description: "A test project",
        imageUrl: "not-a-url",
        technologies: ["React"],
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProjectSchema", () => {
    it("allows partial updates", () => {
      const partialUpdate = {
        title: "Updated Project Title",
      };

      const result = updateProjectSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("rejects invalid URL in partial update", () => {
      const partialUpdate = {
        liveUrl: "not-a-url",
      };

      const result = updateProjectSchema.safeParse(partialUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("validates valid credentials", () => {
      const validCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validCredentials);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const invalidCredentials = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const invalidCredentials = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("validates valid profile update", () => {
      const validProfile = {
        headline: "Software Engineer",
        bioEn: "I am a software engineer",
        bioAr: "أنا مهندس برمجيات",
        yearsOfExperience: 5,
        contactEmail: "test@example.com",
      };

      const result = updateProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const invalidProfile = {
        contactEmail: "not-an-email",
      };

      const result = updateProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("rejects negative years of experience", () => {
      const invalidProfile = {
        yearsOfExperience: -1,
      };

      const result = updateProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });
});