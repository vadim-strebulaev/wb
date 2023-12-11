FROM node:20-alpine3.17 as build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN ls src/assets/layout/images -la
RUN npm run build -- --configuration production

FROM nginx:mainline-alpine

ARG SELLER_DH_PARAM

RUN echo -e "$SELLER_DH_PARAM" > /etc/ssl/certs/dhparam-2048.pem

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/seller /usr/share/nginx/html
