# Twins

[![Continuous deployment](https://github.com/kinton/twins/actions/workflows/main.yml/badge.svg)](https://github.com/kinton/twins/actions/workflows/main.yml)

Built on the [T3 Stack](https://create.t3.gg/) project.

## Database operations
- Push `npx prisma db push`
- All commands `npx prisma`
- Seed `npx ts-node --esm prisma/seed.ts`

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

- `docker compose build`
- `docker compose up`
- `docker compose exec app sh`
- `npx prisma generate`
- `npx prisma db push` TODO: change to `npx prisma migrate production`
- `npx prisma db seed` or `npx ts-node --esm prisma/seed.ts`

## TODO
1. Query production logging (middleware to trpc with winston?)
2. Setup auto deploy with proper migrations 
