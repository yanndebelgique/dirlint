#!/bin/bash

# Publish script for dirlint
# Usage: ./publish.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}

echo "📦 Publishing dirlint to npm..."
echo ""

# Check if logged in to npm
echo "Checking npm authentication..."
npm whoami || {
  echo "❌ Not logged in to npm. Please run: npm login"
  exit 1
}

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Bump version
echo "📝 Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE -m "Bump version to %s"

# Publish to npm
echo "🚀 Publishing to npm..."
npm publish --access public

echo ""
echo "✅ Successfully published!"
echo ""
echo "📌 Next steps:"
echo "   git push origin main --tags"
