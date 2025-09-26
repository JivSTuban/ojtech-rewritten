import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from parent directory if it exists
  const parentEnvPath = path.resolve(__dirname, '../.env')
  const envDir = fs.existsSync(parentEnvPath) ? path.resolve(__dirname, '..') : undefined
  
  // Load env file based on mode
  const env = loadEnv(mode, envDir || process.cwd())
  
  console.log('Environment variables loaded from:', envDir || process.cwd())
  console.log('API URL:', env.VITE_API_URL)
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@providers': path.resolve(__dirname, './src/providers'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    // Explicitly set envDir to use the parent directory's .env file
    envDir: envDir
  };
})
