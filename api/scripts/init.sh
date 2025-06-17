#!/bin/bash
set -e

cd /var/app
npm install
npm run dev
npm run typeorm schema:sync




