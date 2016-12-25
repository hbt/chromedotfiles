#!/bin/sh

while inotifywait -e modify -q -r --exclude .idea .; do
    touch .extension-reloader
done
