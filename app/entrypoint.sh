#!/bin/sh

npx --yes prisma migrate deploy

npm run workers:runRepeatablQueues
npm run workers:worker:searchQuerySubscription

node server.js
