FROM nginx:alpine

COPY numbers.html cards.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY images /usr/share/nginx/html/images
COPY js /usr/share/nginx/html/js