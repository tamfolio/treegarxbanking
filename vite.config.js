import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import subresourceIntegrity from 'vite-plugin-subresource-integrity'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    subresourceIntegrity()
  ]
})