// vite.config.js
export default {
  plugins: [],
  server: {
    port: 5174, // Alterado de 5173 para 5174
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
