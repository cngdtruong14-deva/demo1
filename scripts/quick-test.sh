#!/bin/bash

# Quick Test Script for Smart Restaurant Platform
# Run this after fixing all issues

echo "🚀 Smart Restaurant - Quick Test Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health Check
echo "📡 Test 1: Backend Health Check"
echo "--------------------------------"
response=$(curl -s http://localhost:5000/api/v1/health)
if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend is running and healthy${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "   Please start backend: cd backend && npm run dev"
fi
echo ""

# Test 2: Public Menu API
echo "🍽️  Test 2: Public Menu API"
echo "--------------------------------"
response=$(curl -s http://localhost:5000/api/v1/menu/demo-branch-1)
if echo "$response" | grep -q "Nhà Hàng"; then
    product_count=$(echo "$response" | grep -o "prod-[0-9]*" | wc -l)
    echo -e "${GREEN}✅ Menu API working${NC}"
    echo "   Found $product_count products"
else
    echo -e "${RED}❌ Menu API not responding${NC}"
fi
echo ""

# Test 3: Frontend Customer
echo "👨‍💼 Test 3: Frontend Customer"
echo "--------------------------------"
response=$(curl -s http://localhost:3000)
if echo "$response" | grep -q "menu\|thực đơn"; then
    echo -e "${GREEN}✅ Frontend Customer is running${NC}"
    echo "   Access at: http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  Frontend Customer might not be running${NC}"
    echo "   Please start: cd frontend-customer && npm run dev"
fi
echo ""

# Test 4: Frontend Admin
echo "🖥️  Test 4: Frontend Admin"
echo "--------------------------------"
response=$(curl -s http://localhost:3001)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend Admin is accessible${NC}"
    echo "   Access at: http://localhost:3001"
else
    echo -e "${YELLOW}⚠️  Frontend Admin might not be running${NC}"
    echo "   Please start: cd frontend-admin && npm run dev"
fi
echo ""

# Summary
echo "📊 Test Summary"
echo "========================================"
echo ""
echo "If all tests passed:"
echo "  1. Open http://localhost:3000 to see customer menu"
echo "  2. Open http://localhost:3001 for admin portal"
echo "  3. Try adding items to cart and checkout"
echo ""
echo "If any test failed:"
echo "  - Check that services are running"
echo "  - Check .env configuration"
echo "  - Check backend logs for errors"
echo ""
echo "🎉 Happy testing!"

