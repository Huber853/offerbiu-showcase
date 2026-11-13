import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// 第二个项目（Offerbiu 开发历程）被构建到 public/history/。
// 这个小插件让 /history 和 /history/ 在开发服务器和 preview 里都返回 history/index.html。
function historyIndex(): Plugin {
  const rewrite = (req: any, res: any, next: () => void) => {
    const [path, query = ''] = (req.url || '').split('?')
    if (path === '/history') { res.statusCode = 302; res.setHeader('Location', '/history/' + (query ? '?' + query : '')); res.end(); return }
    if (path === '/history/' || path === '/history/index.html') req.url = '/history/index.html' + (query ? '?' + query : '')
    next()
  }
  return {
    name: 'offerbiu-history-index',
    configureServer(server) { server.middlewares.use(rewrite) },
    configurePreviewServer(server) { server.middlewares.use(rewrite) },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [historyIndex(), react()],
  server: { port: 5173 },
  preview: { port: 4173 },
})
