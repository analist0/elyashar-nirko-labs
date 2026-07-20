#!/bin/bash
# Start Image Generation API

echo "🚀 Starting Image Generation API with Ollama..."

# Check if required environment variables are set. No hardcoded fallback
# secrets here on purpose — export your real values before running this.
if [ -z "$OLLAMA_API_KEY" ]; then
    echo "⚠️  OLLAMA_API_KEY not set — image generation calls will fail"
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "⚠️  TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — Telegram notifications disabled"
fi

echo "📡 Ollama API URL: ${OLLAMA_API_URL:-https://api.ollama.ai/v1}"
echo "📁 Images directory: $(pwd)/../public/images/generated"
echo ""

# Start the API
exec python image_service.py
