import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(backendRoot, '.env');
const schemaPath = path.resolve(backendRoot, 'prisma', 'schema.prisma');

dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');
const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

if (fs.existsSync(schemaPath)) {
  let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  let modified = false;

  if (targetProvider === 'sqlite') {
    // Garantir provider = "sqlite" e remover directUrl
    const sqliteDatasource = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
    const datasourceRegex = /datasource db \{[\s\S]*?\}/;
    if (datasourceRegex.test(schemaContent)) {
      const currentMatch = schemaContent.match(datasourceRegex)[0];
      if (currentMatch !== sqliteDatasource) {
        schemaContent = schemaContent.replace(datasourceRegex, sqliteDatasource);
        modified = true;
      }
    }
  } else {
    // Garantir provider = "postgresql" e directUrl (apenas se DIRECT_URL existir)
    const hasDirectUrl = Boolean(process.env.DIRECT_URL);
    const postgresDatasource = hasDirectUrl
      ? `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
      : `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;
    const datasourceRegex = /datasource db \{[\s\S]*?\}/;
    if (datasourceRegex.test(schemaContent)) {
      const currentMatch = schemaContent.match(datasourceRegex)[0];
      if (currentMatch !== postgresDatasource) {
        schemaContent = schemaContent.replace(datasourceRegex, postgresDatasource);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
    console.log(`[prepareSchema] Prisma schema configurado para provider: ${targetProvider}`);
  }
}
