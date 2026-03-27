#!/usr/bin/env bash
echo port=8000
echo secret=$(cat /dev/random | tr -cd "[:graph:]" | head -c64)