#!/bin/bash
set -e

# Goat Beard Deployment Script
# Builds the Next.js app and deploys to S3/CloudFront

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$SCRIPT_DIR/terraform"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Goat Beard Deployment ===${NC}"

# Check if terraform outputs exist
cd "$TERRAFORM_DIR"
if ! terraform output s3_bucket &>/dev/null; then
    echo -e "${RED}Error: Terraform not initialized or applied. Run 'terraform init && terraform apply' first.${NC}"
    exit 1
fi

S3_BUCKET=$(terraform output -raw s3_bucket)
CF_DISTRIBUTION=$(terraform output -raw cloudfront_distribution_id)

echo -e "${YELLOW}S3 Bucket: $S3_BUCKET${NC}"
echo -e "${YELLOW}CloudFront Distribution: $CF_DISTRIBUTION${NC}"

# Build the Next.js app
echo -e "${GREEN}Building Next.js app...${NC}"
cd "$PROJECT_ROOT"
npm run build

# Sync to S3
echo -e "${GREEN}Syncing to S3...${NC}"
aws s3 sync out/ "s3://$S3_BUCKET/" --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "*.json"

# HTML and JSON files with shorter cache
aws s3 sync out/ "s3://$S3_BUCKET/" \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "*.json"

# Invalidate CloudFront cache
echo -e "${GREEN}Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
    --distribution-id "$CF_DISTRIBUTION" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}Site: https://goatbeards.jdlabs.top${NC}"
