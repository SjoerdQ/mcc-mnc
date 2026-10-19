FROM node:22-bookworm-slim

WORKDIR /app
ENV OUTPUT_FILE=/output/mcc-mnc.json

RUN mkdir -p /output

# Install exactly the dependency versions recorded in package-lock.json.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY index.mjs ./

CMD ["node", "index.mjs"]
