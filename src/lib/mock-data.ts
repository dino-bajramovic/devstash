export const mockUser = {
  id: "dinotelo",
  name: "Dino Bajramovic",
  email: "dinobajramovic01@gmail.com",
  image: null as string | null,
  isPro: false,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-15",
};

export const mockItemTypes = [
  { id: "type_snippet", name: "Snippet", icon: "Code", color: "#3b82f6", isSystem: true, count: 24 },
  { id: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true, count: 18 },
  { id: "type_command", name: "Command", icon: "Terminal", color: "#f97316", isSystem: true, count: 15 },
  { id: "type_note", name: "Note", icon: "StickyNote", color: "#fde047", isSystem: true, count: 12 },
  { id: "type_file", name: "File", icon: "File", color: "#6b7280", isSystem: true, count: 5 },
  { id: "type_image", name: "Image", icon: "Image", color: "#ec4899", isSystem: true, count: 3 },
  { id: "type_link", name: "Link", icon: "Link", color: "#10b981", isSystem: true, count: 8 },
];

export const mockCollections = [
  {
    id: "col_react_patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    userId: "user_1",
    defaultTypeId: "type_snippet",
    dominantTypeId: "type_snippet",
  },
  {
    id: "col_python_snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    userId: "user_1",
    defaultTypeId: "type_snippet",
    dominantTypeId: "type_snippet",
  },
  {
    id: "col_context_files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    userId: "user_1",
    defaultTypeId: "type_file",
    dominantTypeId: "type_file",
  },
  {
    id: "col_git_commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    userId: "user_1",
    defaultTypeId: "type_command",
    dominantTypeId: "type_command",
  },
  {
    id: "col_interview_prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    userId: "user_1",
    defaultTypeId: "type_snippet",
    dominantTypeId: "type_snippet",
  },
  {
    id: "col_ai_prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    userId: "user_1",
    defaultTypeId: "type_prompt",
    dominantTypeId: "type_prompt",
  },
];

export const mockItems = [
  {
    id: "item_useauth_hook",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "TEXT" as const,
    content: `import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: ["react", "auth", "hooks"],
    collectionIds: ["col_react_patterns"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "item_api_error_handling",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "TEXT" as const,
    content: `async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      return await res.json()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 2 ** i * 1000))
    }
  }
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: ["api", "error", "typescript"],
    collectionIds: ["col_react_patterns", "col_interview_prep"],
    createdAt: "2024-01-12",
    updatedAt: "2024-01-12",
  },
  {
    id: "item_git_interactive_rebase",
    title: "Interactive Rebase",
    description: "Squash and reword commits before pushing",
    contentType: "TEXT" as const,
    content: `git rebase -i HEAD~3`,
    language: "bash",
    isFavorite: false,
    isPinned: false,
    userId: "user_1",
    itemTypeId: "type_command",
    tags: ["git", "rebase"],
    collectionIds: ["col_git_commands"],
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
  {
    id: "item_code_review_prompt",
    title: "Code Review Prompt",
    description: "System prompt for thorough code reviews",
    contentType: "TEXT" as const,
    content: `You are a senior software engineer performing a code review. Analyze the following code for:
- Security vulnerabilities
- Performance issues
- Code quality and readability
- Edge cases and error handling
Provide specific, actionable feedback.`,
    language: null,
    isFavorite: true,
    isPinned: false,
    userId: "user_1",
    itemTypeId: "type_prompt",
    tags: ["ai", "code-review"],
    collectionIds: ["col_ai_prompts"],
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
  {
    id: "item_python_list_comprehension",
    title: "List Comprehension Patterns",
    description: "Common Python list comprehension examples",
    contentType: "TEXT" as const,
    content: `# Filter and transform
evens_squared = [x**2 for x in range(10) if x % 2 == 0]

# Flatten nested list
flat = [item for sublist in nested for item in sublist]

# Dict comprehension
word_lengths = {word: len(word) for word in words}`,
    language: "python",
    isFavorite: false,
    isPinned: false,
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: ["python", "lists"],
    collectionIds: ["col_python_snippets"],
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "item_react_context_setup",
    title: "React Context Setup",
    description: "Boilerplate for React context with TypeScript",
    contentType: "TEXT" as const,
    content: `import { createContext, useContext, useState } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  )
}`,
    language: "typescript",
    isFavorite: true,
    isPinned: false,
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: ["react", "context", "typescript"],
    collectionIds: ["col_react_patterns"],
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
  },
  {
    id: "item_git_undo_last_commit",
    title: "Undo Last Commit",
    description: "Keep changes staged but remove the commit",
    contentType: "TEXT" as const,
    content: `git reset --soft HEAD~1`,
    language: "bash",
    isFavorite: false,
    isPinned: false,
    userId: "user_1",
    itemTypeId: "type_command",
    tags: ["git", "undo"],
    collectionIds: ["col_git_commands"],
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
  {
    id: "item_nextjs_docs_link",
    title: "Next.js App Router Docs",
    description: "Official documentation for Next.js App Router",
    contentType: "URL" as const,
    url: "https://nextjs.org/docs/app",
    language: null,
    isFavorite: false,
    isPinned: false,
    userId: "user_1",
    itemTypeId: "type_link",
    tags: ["nextjs", "docs"],
    collectionIds: ["col_react_patterns"],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];