sed -i 's/const PORT = process.env.PORT || 3000;/const PORT = Number(process.env.PORT) || 3000;/' server.ts
