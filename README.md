# Twins

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
- `npx prisma db seed`
- `npx prisma db push` TODO: change to `npx prisma migrate production`
