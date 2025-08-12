#!/bin/sh
set -e

CONFIG_FILE=/usr/share/nginx/html/config.template.js
TARGET_FILE=/usr/share/nginx/html/config.js

echo "Injecting environment variables into config.js..."

envsubst < "$CONFIG_FILE" > "$TARGET_FILE"

echo "Done. Starting Nginx..."
