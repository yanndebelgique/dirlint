#!/bin/bash

# Publish script for dirlint
# Usage: NPM_TOKEN=your_token ./publish.sh [patch|minor|major]
# Or set NPM_TOKEN in your environment

set -e

VERSION_TYPE=${1:-patch}

echo "📦 Publishing dirlint to npm..."
echo ""

# Check if NPM_TOKEN is provided
if [ -z "$NPM_TOKEN" ]; then
  echo "❌ NPM_TOKEN environment variable is not set"
  echo "Usage: NPM_TOKEN=your_token ./publish.sh [patch|minor|major]"
  exit 1
fi

# Setup npm authentication with token
echo "Setting up npm authentication..."
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc.publish
export NPM_CONFIG_USERCONFIG=~/.npmrc.publish

# Check if logged in to npm
echo "Checking npm authentication..."
npm whoami || {
  echo "❌ Token authentication failed"
  rm ~/.npmrc.publish
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

# Cleanup
rm ~/.npmrc.publish
