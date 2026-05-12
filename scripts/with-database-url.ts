import { spawn } from 'child_process';
import { resolveDatabaseUrl } from '../src/lib/database-url';

const command = process.argv.slice(2);

async function main() {
  if (command.length === 0) {
    console.error('Usage: tsx scripts/with-database-url.ts <command> [...args]');
    process.exit(1);
  }

  const databaseUrl = await resolveDatabaseUrl();

  if (!databaseUrl) {
    console.error('DATABASE_URL is required unless DATABASE_AUTH_MODE=iam is configured.');
    process.exit(1);
  }

  const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });

  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
