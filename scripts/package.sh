#!/usr/bin/env bash
# Empaqueta l'extensió en dist/edutictac-correu-classic-vX.Y.Z.zip
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')
mkdir -p dist
out="dist/edutictac-correu-classic-v${version}.zip"
rm -f "$out"
zip -qr "$out" manifest.json _locales content popup icons assets/mark.png assets/logo.png LICENSE
echo "$out"
