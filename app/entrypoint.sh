#!/bin/sh

npx --yes prisma migrate deploy

npm run workers:runRepeatableQueues
npm run workers:worker:searchQuerySubscription

node server.js
