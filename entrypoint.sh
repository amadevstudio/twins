#!/bin/sh

npx --yes prisma migrate deploy

node server.js
