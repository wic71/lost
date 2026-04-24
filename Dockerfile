FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY resources /usr/share/nginx/html/resources
COPY favicon.ico /usr/share/nginx/html/favicon.ico
COPY favicon-16x16.png /usr/share/nginx/html/favicon-16x16.png
COPY favicon-32x32.png /usr/share/nginx/html/favicon-32x32.png
COPY apple-touch-icon.png /usr/share/nginx/html/apple-touch-icon.png

EXPOSE 80
