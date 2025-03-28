#!/bin/bash

echo "🚀 Limpiando cachés y archivos innecesarios..."

# Eliminar __pycache__, *.pyc, *.pyo, *.pyd (Python)
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete
find . -type f -name "*.pyd" -delete

# Eliminar dist, build y cachés de Vite/Next/Nuxt/etc.
rm -rf front/dist/ front/.parcel-cache/ front/.next/ front/.nuxt/ front/.svelte-kit/ front/.vite/

# Eliminar archivos de logs
find . -type f -name "*.log" -delete
rm -rf logs/

# Eliminar archivos de cache de ESLint, TypeScript, etc.
rm -rf .eslintcache .cache .tsbuildinfo

# Eliminar archivos temporales
find . -type f -name "*.swp" -delete
find . -type f -name "*.swo" -delete
find . -type f -name "*.bak" -delete
find . -type f -name "*.tmp" -delete


echo "✅ Proyecto limpio y listo para un commit bello 🚀"
