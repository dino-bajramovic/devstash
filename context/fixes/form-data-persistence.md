# Fix: Form Data Lost on Validation Error

## Problem

Auth forms that use server actions redirect to themselves on validation errors
(`redirect("/register?error=password_mismatch")`). A redirect causes a full page
navigation, which wipes all form inputs. The user has to re-enter everything.

## Affected Forms

| Form | Fields lost | Fields that should persist |
|------|-------------|---------------------------|
| Register | name, email, passwords | name, email (passwords must be re-entered) |
| Sign-in | email, password | email (password must be re-entered) |
| Forgot password | email | email |

Reset-password is intentionally excluded — password fields should always be cleared
for security.

## Fix

Use React 19's `useActionState` to return error state from the server action
instead of redirecting. React automatically resets the form after the action
runs, then `defaultValue` on the name/email inputs repopulates them from the
returned state.

```
On error:   return { error: "...", values: { name, email } }  // no redirect
On success: redirect("/...")                                   // still works
```

Password fields never get `defaultValue` — the user must re-enter them.

## Implementation

- Server actions extracted to `actions.ts` files (required for `useActionState`)
- Forms converted to client components using `useActionState`
- `defaultValue={state.values?.email}` on name/email inputs
- No `defaultValue` on password inputs