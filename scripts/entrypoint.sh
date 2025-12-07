#!/bin/sh

echo "🔍 Loading .env variables..."

if [ -f "/app/.env" ]; then
  export $(grep -v '^#' /app/.env | xargs)
fi

echo "Generating config.js..."

echo "window.RUNTIME_CONFIG = {" > /usr/share/nginx/html/config.js

env | grep '^VITE_' | while IFS='=' read -r key value; do
  echo "  \"$key\": \"$value\"," >> /usr/share/nginx/html/config.js
done

sed -i '$ s/,$//' /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

echo "config.js generated:"
cat /usr/share/nginx/html/config.js

nginx -g "daemon off;"
