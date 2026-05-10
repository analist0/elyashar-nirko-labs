#!/bin/bash
# ============================================================================
# Ultra Content Machine — Cron Setup Installer
# Installs daily cron job to run the blog generation pipeline at 09:00
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}" && pwd)"
CRON_SCRIPT="${PROJECT_ROOT}/scripts/run-daily-blog.sh"
CRON_TIME="0 9 * * *"
LOGS_DIR="${PROJECT_ROOT}/logs"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================================================${NC}"
echo -e "${CYAN}  Ultra Content Machine — Cron Setup Installer${NC}"
echo -e "${CYAN}========================================================================${NC}"
echo ""

# ── Validation ──────────────────────────────────────────────────────────────
echo -e "${CYAN}[1/6] Validating project structure...${NC}"

if [ ! -f "${CRON_SCRIPT}" ]; then
  echo -e "${RED}ERROR: run-daily-blog.sh not found at:${NC}"
  echo -e "${RED}  ${CRON_SCRIPT}${NC}"
  exit 1
fi

if [ ! -f "${PROJECT_ROOT}/.env.local" ]; then
  echo -e "${YELLOW}WARN: .env.local not found!${NC}"
  echo -e "${YELLOW}  Make sure API keys are configured before running the pipeline.${NC}"
fi

echo -e "${GREEN}✓ Project structure validated${NC}"

# ── Make Scripts Executable ───────────────────────────────────────────────────
echo -e "${CYAN}[2/6] Setting executable permissions...${NC}"

chmod +x "${PROJECT_ROOT}/scripts/run-daily-blog.sh"
chmod +x "${PROJECT_ROOT}/scripts/generate-content.ts"
chmod +x "${PROJECT_ROOT}/scripts/generate-images.ts"
chmod +x "${PROJECT_ROOT}/scripts/fal-ai.ts"
chmod +x "${PROJECT_ROOT}/scripts/ollama-ai.ts"
chmod +x "${PROJECT_ROOT}/scripts/cloudflare-ai.ts"

echo -e "${GREEN}✓ Scripts are now executable${NC}"

# ── Create Logs Directory ─────────────────────────────────────────────────────
echo -e "${CYAN}[3/6] Creating logs directory...${NC}"

mkdir -p "${LOGS_DIR}"
touch "${LOGS_DIR}/.gitkeep"

echo -e "${GREEN}✓ Logs directory ready: ${LOGS_DIR}${NC}"

# ── Cron Service Check ────────────────────────────────────────────────────────
echo -e "${CYAN}[4/6] Checking cron service...${NC}"

if ! command -v crontab &> /dev/null; then
  echo -e "${YELLOW}WARN: crontab not found. Installing cron...${NC}"

  if command -v apt-get &> /dev/null; then
    sudo apt-get update -qq && sudo apt-get install -y -qq cron
  elif command -v yum &> /dev/null; then
    sudo yum install -y cronie
  elif command -v dnf &> /dev/null; then
    sudo dnf install -y cronie
  else
    echo -e "${RED}ERROR: Cannot install cron automatically.${NC}"
    echo -e "${RED}Please install cron manually and run this script again.${NC}"
    exit 1
  fi
fi

# Start cron service if not running
if command -v systemctl &> /dev/null; then
  if ! systemctl is-active --quiet cron 2>/dev/null && ! systemctl is-active --quiet crond 2>/dev/null; then
    echo -e "${YELLOW}Starting cron service...${NC}"
    sudo systemctl start cron 2>/dev/null || sudo systemctl start crond 2>/dev/null || true
    sudo systemctl enable cron 2>/dev/null || sudo systemctl enable crond 2>/dev/null || true
  fi
elif command -v service &> /dev/null; then
  if ! service cron status &>/dev/null && ! service crond status &>/dev/null; then
    echo -e "${YELLOW}Starting cron service...${NC}"
    sudo service cron start 2>/dev/null || sudo service crond start 2>/dev/null || true
  fi
fi

echo -e "${GREEN}✓ Cron service ready${NC}"

# ── Install Cron Job ────────────────────────────────────────────────────────
echo -e "${CYAN}[5/6] Installing cron job...${NC}"

CRON_JOB="${CRON_TIME} cd ${PROJECT_ROOT} && bash ${CRON_SCRIPT} >> ${LOGS_DIR}/cron.log 2>&1"
CRON_MARKER="# Ultra Content Machine — Auto Blog Pipeline"

# Get current crontab
CURRENT_CRON=""
if crontab -l &>/dev/null; then
  CURRENT_CRON=$(crontab -l)
fi

# Check if already installed
if echo "${CURRENT_CRON}" | grep -q "Ultra Content Machine"; then
  echo -e "${YELLOW}⚠ Cron job already installed. Updating...${NC}"
  # Remove old entry
  CURRENT_CRON=$(echo "${CURRENT_CRON}" | grep -v "Ultra Content Machine")
fi

# Add new entry
NEW_CRON="${CURRENT_CRON}
${CRON_MARKER}
${CRON_JOB}"

# Install
printf '%s\n' "${NEW_CRON}" | crontab -

echo -e "${GREEN}✓ Cron job installed:${NC}"
echo -e "${GREEN}  Schedule: ${CRON_TIME} (daily at 09:00)${NC}"
echo -e "${GREEN}  Command:  ${CRON_SCRIPT}${NC}"

# ── Verify ──────────────────────────────────────────────────────────────────
echo -e "${CYAN}[6/6] Verifying installation...${NC}"

if crontab -l | grep -q "Ultra Content Machine"; then
  echo -e "${GREEN}✓ Cron job verified in crontab${NC}"
else
  echo -e "${RED}ERROR: Cron job verification failed!${NC}"
  exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
  echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
else
  echo -e "${YELLOW}⚠ Node.js not found — required for pipeline${NC}"
fi

# Check PM2
if command -v pm2 &> /dev/null; then
  echo -e "${GREEN}✓ PM2: installed${NC}"
else
  echo -e "${YELLOW}⚠ PM2 not found — install with: npm install -g pm2${NC}"
fi

# Check tsx
if command -v npx &> /dev/null && npx tsx --version &>/dev/null; then
  echo -e "${GREEN}✓ tsx: available via npx${NC}"
else
  echo -e "${YELLOW}⚠ tsx not found — install with: npm install -g tsx${NC}"
fi

echo ""
echo -e "${CYAN}========================================================================${NC}"
echo -e "${GREEN}  ✅ Setup Complete!${NC}"
echo -e "${CYAN}========================================================================${NC}"
echo ""
echo -e "${CYAN}What's next:${NC}"
echo -e "  1. Ensure .env.local has all required API keys"
echo -e "  2. Run a test: ${YELLOW}bash scripts/run-daily-blog.sh${NC}"
echo -e "  3. Check logs: ${YELLOW}tail -f logs/daily-blog-$(date +%Y-%m-%d).log${NC}"
echo -e "  4. View cron: ${YELLOW}crontab -l${NC}"
echo -e "  5. PM2 setup: ${YELLOW}pm2 start npm --name 'portfolio' -- start${NC}"
echo ""
echo -e "${CYAN}Daily schedule:${NC} 09:00 Israel time (UTC+3)"
echo -e "${CYAN}Log location:${NC}  ${LOGS_DIR}/"
echo ""
