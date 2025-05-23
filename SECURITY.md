# Security Guidelines for HockeyScorer Project

This document outlines security practices to follow when developing for the HockeyScorer project.

## Pre-commit Security Checks

The repository has pre-commit hooks that automatically check for common security issues:

- Hardcoded API keys or secrets
- Hardcoded credentials
- Potential injection vulnerabilities
- Security-related TODOs/FIXMEs

## General Security Guidelines

1. **Never commit secrets**: API keys, passwords, and other sensitive information should be stored in environment variables, not in the codebase.

2. **Use environment variables**: For sensitive data, always use environment variables with `.env` files (which should be in `.gitignore`).

3. **Validate user input**: Always validate and sanitize all user input, especially when using it in database queries or API calls.

4. **Use prepared statements**: For SQL queries, always use prepared statements or parameterized queries to prevent SQL injection.

5. **Keep dependencies updated**: Regularly update dependencies to ensure security patches are applied.

6. **Implement proper authentication**: Ensure that authentication is robust and follows best practices.

7. **Follow least privilege principle**: Services should only have access to what they absolutely need.

## Firebase Security

When working with Firebase:

1. Do not expose Firebase admin SDK credentials in client-side code
2. Use Firebase Security Rules to restrict access to data
3. Validate all data on the server, not just in the client
4. Use Firebase Authentication for user management

## Bypassing Pre-commit Hooks

While not recommended, in emergency situations you can bypass the pre-commit hooks with:

```
git commit --no-verify -m "Your commit message"
```

Make sure to address any security issues as soon as possible after committing with this flag.
