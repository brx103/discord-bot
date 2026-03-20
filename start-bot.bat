@echo off
cd /d C:\Users\desou\discord-bot
pm2 start index.js --name "discord-bot"
pm2 save
