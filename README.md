# Connect4 Project

Connect4 is a project aimed at implementing the classic game of the same name using web technologies.

The application is intended to enable gameplay in three modes, both locally and over the network. Additionally, the application will be adapted to function as a native app using Progressive Web App (PWA) technology.

## Used technologies

- Next.js
- Typescript
- CSS Modules
- Express.js
- MongoDB
- Web Sockets (ws)
- PWA
- Docker

## Self-hosting

### Requiraments

- Docker
- Docker compose
- Cron (optional, required for automated cleanup in production)

### Enviroment configuration

An environment file is required for the application to run.

1. Copy the example file:

```bash
cp .env.example .env
```

2. Fill in required values described in `.env.example`

### Development

Development uses Docker with:

- bind-mounted source code

- live reload for the web server and client

---

To run dev:

1. Install dependencies: (For IDE support)

```bash
cd ./client
npm install
cd ../server
npm install
```

2. Build images:

```bash
docker build -t connect4-client ./client
docker build -t connect4-server ./server
```

3. Start the app (dev mode):

```bash
docker compose up
```

4. Cleanup worker (manual):

```bash
./scripts/run_cleanup.sh
```

### Production

Production uses the same image with stricter settings.

---

To run production:

1. Build images:

```bash
docker build -t connect4-client ./client
docker build -t connect4-server ./server
```

2. Setup cron jobs:

```bash
./scripts/setup_cron.sh
```

> Schedules the cleanup worker to run once per day via cron.

3. Start the app:

```bash
docker compose -f docker-compose.yml up
```

### Configuring project with NGINX

Example NGINX configuration for this project:

```nginx

http {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=5r/s;
}

server {
    server_name _;
    listen 80;
    # In production you should use `listen 443 ssl;` for HTTPS connections.

    location / {
        limit_req zone=req_limit_per_ip burst=10 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
    }

    location /api {
        limit_req zone=req_limit_per_ip burst=10 nodelay;
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;

    }
    location /server/ws {
        limit_req zone=req_limit_per_ip burst=10 nodelay;
        proxy_pass http://127.0.0.1:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # For WS configuration
    }
}
```

### Removing production systems

To completely remove the production setup, use the provided helper scripts:

- `remove_cron.sh`

    > Removes the scheduled cron job responsible for running the cleanup worker.

---

**Recommended order:**

1. Stop the running containers:

```bash
docker compose down
```

2. Remove the cron job:

```bash
./scripts/remove_cron.sh
```

After these steps, the production environment will be fully removed.
