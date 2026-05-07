#!/bin/bash
# Start Image Generation API

echo "🚀 Starting Image Generation API with Ollama..."

# Check if required environment variables are set
if [ -z "$OLLAMA_API_KEY" ]; then
    echo "⚠️  OLLAMA_API_KEY not set, using default"
    export OLLAMA_API_KEY="92da2aca5f5c44509b40a428ce9bba14"
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️  TELEGRAM_BOT_TOKEN not set, using default"
    export TELEGRAM_BOT_TOKEN="7908824633:AAHryoTh2q0ieiavwyYU44oNMiwMAtF-A9o"
fi

if [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "⚠️  TELEGRAM_CHAT_ID not set, using default"
    export TELEGRAM_CHAT_ID="6457374757"
fi

echo "📡 Ollama API URL: ${OLLAMA_API_URL:-https://api.ollama.ai/v1}"
echo "📁 Images directory: $(pwd)/../public/images/generated"
echo "🤖 Telegram Bot: Enabled"
echo ""

# Start the API
exec python image_service.py
