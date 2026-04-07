#!/bin/sh
cat > /usr/share/nginx/html/config.js << EOF
window.__ENV__ = {
  UMAMI_WEBSITE_ID: "${UMAMI_WEBSITE_ID:-}",
  UMAMI_URL: "${UMAMI_URL:-}"
};
EOF
exec nginx -g 'daemon off;'
