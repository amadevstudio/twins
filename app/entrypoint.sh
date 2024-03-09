#!/bin/sh

npm run workers:runRepeatableQueues
npm run workers:worker:searchQuerySubscription

node server.js
