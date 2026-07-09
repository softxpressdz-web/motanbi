sed -i 's/async function startServer() {/export const app = express();/' server.ts
sed -i 's/  const app = express();//' server.ts
sed -i 's/  const PORT = 3000;//' server.ts
sed -i 's/  \/\/ Vite middleware for development/  const PORT = process.env.PORT || 3000;\n  async function startViteServer() {\n  \/\/ Vite middleware for development/' server.ts
sed -i 's/startServer();/if (!process.env.VERCEL) {\n  startViteServer();\n}/' server.ts
