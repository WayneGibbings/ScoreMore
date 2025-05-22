#!/usr/bin/env node

/**
 * Pre-commit security check script for HockeyScorer
 * This script checks for common security issues in the codebase
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Patterns that might indicate security issues
const SECURITY_PATTERNS = [
  // API keys and secrets
  {
    pattern:
      /(['"])(?:api|private|secret)(?:_?key|_?token|_?secret)(['"])\s*:\s*(['"])[a-zA-Z0-9_-]{16,}(['"])/gi,
    message: 'Potential API key or secret found',
  },

  // Hardcoded credentials
  {
    pattern: /(['"])(?:password|passwd|pwd|pass)(['"])\s*:\s*(['"])[^'"]{3,}(['"])/gi,
    message: 'Potential hardcoded password found',
  },

  // Firebase API keys (these are actually safe to commit, but good to check anyway)
  {
    pattern: /(['"])AIza[0-9A-Za-z\-_]{35}(['"])/g,
    message: 'Firebase API key found - ensure this is a public API key',
  },

  // AWS Access Keys
  {
    pattern: /(['"])(?:AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}(['"])/g,
    message: 'Potential AWS access key found',
  },

  // TODO/FIXME with security implications
  {
    pattern:
      /\/\/\s*(?:TODO|FIXME)(?::.*)(?:security|auth|authenti[cz]ation|authori[zs]ation|xss|csrf|injection)/gi,
    message: 'Security-related TODO/FIXME comment found',
  },

  // SQL injection vulnerabilities
  {
    pattern: /execute\s*\(\s*["']\s*(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP).*\+/gi,
    message: 'Potential SQL injection vulnerability (string concatenation in query)',
  },
];

// Files and directories to ignore
const IGNORE_PATTERNS = ['node_modules', 'dist', '.git', '*.min.js', '*.lock', 'package-lock.json'];

// Function to check if a file should be ignored
function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => {
    if (pattern.startsWith('*')) {
      return filePath.endsWith(pattern.slice(1));
    }
    return filePath.includes(path.sep + pattern) || filePath === pattern;
  });
}

// Get the list of staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM').toString();
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

// Check a file for security issues
function checkFileForSecurityIssues(filePath) {
  if (shouldIgnore(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    SECURITY_PATTERNS.forEach(({ pattern, message }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        issues.push({ file: filePath, message, matches: matches.length });
      }
    });

    return issues;
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
    return [];
  }
}

// Main function
function main() {
  const stagedFiles = getStagedFiles();
  let issues = [];

  stagedFiles.forEach(file => {
    const fileIssues = checkFileForSecurityIssues(file);
    issues = [...issues, ...fileIssues];
  });

  if (issues.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '⚠️  Security issues found:');
    issues.forEach(({ file, message, matches }) => {
      console.error('\x1b[33m%s\x1b[0m', `  • ${file}: ${message} (${matches} matches)`);
    });
    console.error(
      '\x1b[31m%s\x1b[0m',
      '\nFix these security issues before committing or use git commit --no-verify to bypass this check\n'
    );
    process.exit(1);
  } else {
    // eslint-disable-next-line no-console
    console.log('\x1b[32m%s\x1b[0m', '✅ No security issues found');
  }
}

main();
