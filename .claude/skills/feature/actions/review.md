# Review Action

1. Read current-feature.md to understand the goals
2. Run `git log --oneline` to find the feature commits, then `git diff <base>..<head>` to see all changes
3. Check only what is relevant to this specific feature:
   - ✅ Goals met
   - ❌ Goals missing or incomplete
   - ⚠️ Code quality issues or bugs
   - 🚫 Scope creep (code beyond goals)
4. Do NOT invent checks that are not relevant to this feature.
   - If no schema changed → do not mention migrations
   - If no imports were touched → do not mention unused imports
   - Only report checks that apply to the actual diff
5. Final verdict: Ready to complete or needs changes
