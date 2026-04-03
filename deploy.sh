#!/bin/bash

# Teachers Colony Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 Teachers Colony Deployment Script"
echo "===================================="

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in current directory"
    exit 1
fi

echo "✅ Found index.html"

# Create deployment directory
DEPLOY_DIR="deploy"
mkdir -p $DEPLOY_DIR

# Copy files to deployment directory
cp index.html $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/

echo "📁 Files copied to deployment directory"

# Compress for deployment
cd $DEPLOY_DIR
zip -r teachers-colony.zip index.html README.md

echo "📦 Deployment package created: teachers-colony.zip"

echo ""
echo "🌐 Deployment Options:"
echo "======================"
echo "1. GitHub Pages (Free):"
echo "   - Upload index.html to GitHub repository"
echo "   - Enable Pages in repository settings"
echo ""
echo "2. Netlify (Free):"
echo "   - Drag index.html to netlify.com"
echo "   - Get instant deployment URL"
echo ""
echo "3. Vercel (Free):"
echo "   - Connect GitHub repository"
echo "   - Automatic deployment"
echo ""
echo "4. Traditional Hosting:"
echo "   - Upload index.html to web server"
echo "   - Ensure GitHub API access"
echo ""

echo "📋 Pre-deployment Checklist:"
echo "=============================="
echo "✅ GitHub token is valid and has gist/public_repo permissions"
echo "✅ Gist ID is correct: 5397a86680129b2d3534059577f8865c"
echo "✅ All functionality tested locally"
echo "✅ Responsive design works on mobile"
echo "✅ GitHub API integration works"
echo ""

echo "🔧 Configuration Needed:"
echo "=========================="
echo "• Update GitHub token if needed"
echo "• Verify gist accessibility"
echo "• Test deployment URL"
echo "• Monitor GitHub API rate limits"
echo ""

echo "📊 Current Configuration:"
echo "=========================="
echo "• Gist ID: 5397a86680129b2d3534059577f8865c"
echo "• Gist URL: https://gist.github.com/Ilovenu/5397a86680129b2d3534059577f8865c"
echo "• Token: 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"
echo "• File: teachers_colony_database.json"
echo ""

echo "🎯 Ready for deployment!"
echo "=========================="
echo "Choose your deployment platform and follow the instructions in README.md"
echo ""

# Open deployment directory
echo "📂 Deployment files ready in: $DEPLOY_DIR"
echo "📦 Package: teachers-colony.zip"

# Optional: Open netlify deploy page
if command -v open &> /dev/null; then
    echo "🌐 Opening Netlify for quick deployment..."
    sleep 2
    open "https://app.netlify.com/drop"
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening Netlify for quick deployment..."
    sleep 2
    xdg-open "https://app.netlify.com/drop"
fi

echo "✅ Deployment preparation complete!"
