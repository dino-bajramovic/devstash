import "dotenv/config";
import { PrismaClient, ContentType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!
  .replace("&channel_binding=require", "")
  .replace("sslmode=require", "sslmode=verify-full");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const systemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

async function main() {
  // ── System ItemTypes ──────────────────────────────────────────────────────
  // Prisma 7 rejects null in composite unique where — use findFirst + create/update instead.
  const typeMap: Record<string, string> = {};
  for (const type of systemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true, userId: null },
    });
    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: { icon: type.icon, color: type.color },
      });
      typeMap[type.name] = existing.id;
    } else {
      const created = await prisma.itemType.create({
        data: { ...type, isSystem: true, userId: null },
      });
      typeMap[type.name] = created.id;
    }
  }
  console.log("✓ System ItemTypes seeded");

  // ── Demo User ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log("✓ Demo user seeded");

  // ── Wipe existing demo-user data so re-runs are clean ────────────────────
  await prisma.collection.deleteMany({ where: { userId: user.id } });
  await prisma.item.deleteMany({ where: { userId: user.id } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });
  console.log("✓ Cleared previous demo data");

  // ── Helper: upsert tag ────────────────────────────────────────────────────
  async function tag(name: string) {
    return prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { name, userId: user.id },
    });
  }

  // ── React Patterns ────────────────────────────────────────────────────────
  const reactCollection = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
      defaultTypeId: typeMap["snippet"],
    },
  });

  const reactItems = [
    {
      title: "Custom Hooks — useDebounce & useLocalStorage",
      description: "Utility hooks for debouncing values and persisting state in localStorage",
      content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = (v: T) => {
    setValue(v);
    window.localStorage.setItem(key, JSON.stringify(v));
  };

  return [value, set] as const;
}`,
      language: "typescript",
      tags: ["react", "hooks", "typescript"],
    },
    {
      title: "Context Provider Pattern",
      description: "Type-safe compound Context provider with custom hook guard",
      content: `import { createContext, useContext, ReactNode } from "react";

interface ThemeContextValue {
  theme: "dark" | "light";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}`,
      language: "typescript",
      tags: ["react", "context", "patterns"],
    },
    {
      title: "Utility Functions — cn & formatDate",
      description: "Shared utility helpers used across the app",
      content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, max = 80): string {
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}`,
      language: "typescript",
      tags: ["utility", "typescript", "tailwind"],
    },
  ];

  for (const item of reactItems) {
    const tags = await Promise.all(item.tags.map(tag));
    const created = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: ContentType.TEXT,
        content: item.content,
        language: item.language,
        userId: user.id,
        itemTypeId: typeMap["snippet"],
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
    await prisma.itemCollection.create({
      data: { itemId: created.id, collectionId: reactCollection.id },
    });
  }
  console.log("✓ React Patterns collection seeded");

  // ── AI Workflows ──────────────────────────────────────────────────────────
  const aiCollection = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
      defaultTypeId: typeMap["prompt"],
    },
  });

  const aiItems = [
    {
      title: "Code Review Prompt",
      description: "Structured prompt for thorough AI code reviews",
      content: `You are a senior software engineer performing a code review. Review the following code and provide feedback on:

1. **Correctness** — Does it do what it's supposed to?
2. **Security** — Any vulnerabilities (injection, auth, data exposure)?
3. **Performance** — N+1 queries, unnecessary re-renders, inefficient loops?
4. **Readability** — Clear naming, appropriate abstractions, no magic values?
5. **Edge cases** — What inputs or states could break this?

Format your response as a numbered list of actionable comments. For each issue, specify the line or block and suggest a fix.

\`\`\`
{CODE}
\`\`\``,
      tags: ["ai", "code-review", "prompt"],
    },
    {
      title: "Documentation Generator",
      description: "Generate JSDoc / TSDoc comments for a function",
      content: `Generate comprehensive TSDoc documentation for the following TypeScript function. Include:

- A one-sentence summary
- @param descriptions for every parameter (include type if not obvious from context)
- @returns description
- @throws if the function can throw
- A short @example showing a realistic usage

Keep descriptions concise. Do not restate what the types already say.

Function:
\`\`\`typescript
{FUNCTION}
\`\`\``,
      tags: ["ai", "documentation", "typescript"],
    },
    {
      title: "Refactoring Assistant",
      description: "Prompt for AI-assisted code refactoring with constraints",
      content: `Refactor the following code with these constraints:
- Preserve all existing behaviour exactly
- Improve readability without over-abstracting
- Apply the single-responsibility principle where violated
- Prefer composition over inheritance
- Remove duplication only when the abstraction has an obvious name

After the refactored code, add a short **Rationale** section (3–5 bullet points) explaining each significant change.

\`\`\`
{CODE}
\`\`\``,
      tags: ["ai", "refactoring", "prompt"],
    },
  ];

  for (const item of aiItems) {
    const tags = await Promise.all(item.tags.map(tag));
    const created = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: ContentType.TEXT,
        content: item.content,
        userId: user.id,
        itemTypeId: typeMap["prompt"],
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
    await prisma.itemCollection.create({
      data: { itemId: created.id, collectionId: aiCollection.id },
    });
  }
  console.log("✓ AI Workflows collection seeded");

  // ── DevOps ────────────────────────────────────────────────────────────────
  const devopsCollection = await prisma.collection.create({
    data: {
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
      defaultTypeId: typeMap["snippet"],
    },
  });

  // 1 snippet
  const dockerSnippet = await prisma.item.create({
    data: {
      title: "Dockerfile — Node.js Production",
      description: "Multi-stage Docker build for a Next.js app with standalone output",
      contentType: ContentType.TEXT,
      content: `FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
      language: "dockerfile",
      userId: user.id,
      itemTypeId: typeMap["snippet"],
      tags: { create: [await tag("docker"), await tag("devops"), await tag("nextjs")].map((t) => ({ tagId: t.id })) },
    },
  });
  await prisma.itemCollection.create({ data: { itemId: dockerSnippet.id, collectionId: devopsCollection.id } });

  // 1 command
  const deployCmd = await prisma.item.create({
    data: {
      title: "Deploy to Production",
      description: "Full production deployment sequence with migration and health check",
      contentType: ContentType.TEXT,
      content: `# Pull latest, migrate DB, restart app
git pull origin main && \\
  npm ci --omit=dev && \\
  npx prisma migrate deploy && \\
  pm2 restart devstash --update-env && \\
  pm2 logs devstash --lines 20`,
      userId: user.id,
      itemTypeId: typeMap["command"],
      tags: { create: [await tag("deployment"), await tag("pm2"), await tag("prisma")].map((t) => ({ tagId: t.id })) },
    },
  });
  await prisma.itemCollection.create({ data: { itemId: deployCmd.id, collectionId: devopsCollection.id } });

  // 2 links
  const devopsLinks = [
    {
      title: "GitHub Actions Documentation",
      description: "Official docs for GitHub Actions CI/CD workflows",
      url: "https://docs.github.com/en/actions",
      tags: ["ci-cd", "github", "devops"],
    },
    {
      title: "Docker Official Documentation",
      description: "Complete reference for Docker CLI, Compose, and Dockerfile syntax",
      url: "https://docs.docker.com/reference/",
      tags: ["docker", "containers", "devops"],
    },
  ];

  for (const item of devopsLinks) {
    const tags = await Promise.all(item.tags.map(tag));
    const created = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: ContentType.URL,
        url: item.url,
        userId: user.id,
        itemTypeId: typeMap["link"],
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
    await prisma.itemCollection.create({ data: { itemId: created.id, collectionId: devopsCollection.id } });
  }
  console.log("✓ DevOps collection seeded");

  // ── Terminal Commands ─────────────────────────────────────────────────────
  const terminalCollection = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
      defaultTypeId: typeMap["command"],
    },
  });

  const terminalItems = [
    {
      title: "Git — Undo Last Commit (keep changes)",
      description: "Soft-reset HEAD by one commit, leaving files staged",
      content: `git reset --soft HEAD~1`,
      tags: ["git", "undo"],
    },
    {
      title: "Docker — Remove All Stopped Containers & Dangling Images",
      description: "Prune stopped containers, dangling images, and unused networks",
      content: `docker system prune -f`,
      tags: ["docker", "cleanup"],
    },
    {
      title: "Process — Find and Kill Port",
      description: "Kill whatever process is holding a given port (replace 3000)",
      content: `lsof -ti :3000 | xargs kill -9`,
      tags: ["process", "port", "shell"],
    },
    {
      title: "npm — Clean Install & Audit",
      description: "Delete node_modules and lock file, then do a clean install",
      content: `rm -rf node_modules package-lock.json && npm install && npm audit`,
      tags: ["npm", "dependencies"],
    },
  ];

  for (const item of terminalItems) {
    const tags = await Promise.all(item.tags.map(tag));
    const created = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: ContentType.TEXT,
        content: item.content,
        language: "bash",
        userId: user.id,
        itemTypeId: typeMap["command"],
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
    await prisma.itemCollection.create({ data: { itemId: created.id, collectionId: terminalCollection.id } });
  }
  console.log("✓ Terminal Commands collection seeded");

  // ── Design Resources ──────────────────────────────────────────────────────
  const designCollection = await prisma.collection.create({
    data: {
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
      defaultTypeId: typeMap["link"],
    },
  });

  const designLinks = [
    {
      title: "Tailwind CSS Documentation",
      description: "Official Tailwind CSS v4 utility-first CSS framework reference",
      url: "https://tailwindcss.com/docs",
      tags: ["tailwind", "css", "reference"],
    },
    {
      title: "shadcn/ui Components",
      description: "Beautifully designed components built with Radix UI and Tailwind CSS",
      url: "https://ui.shadcn.com/docs/components",
      tags: ["shadcn", "components", "ui"],
    },
    {
      title: "Radix UI Primitives",
      description: "Unstyled, accessible component primitives for design systems",
      url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
      tags: ["radix", "accessibility", "design-system"],
    },
    {
      title: "Lucide Icons",
      description: "Beautiful & consistent open-source icon set used throughout DevStash",
      url: "https://lucide.dev/icons/",
      tags: ["icons", "lucide", "ui"],
    },
  ];

  for (const item of designLinks) {
    const tags = await Promise.all(item.tags.map(tag));
    const created = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: ContentType.URL,
        url: item.url,
        userId: user.id,
        itemTypeId: typeMap["link"],
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
    await prisma.itemCollection.create({ data: { itemId: created.id, collectionId: designCollection.id } });
  }
  console.log("✓ Design Resources collection seeded");

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
