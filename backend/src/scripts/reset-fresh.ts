import { closeResetConnections, runReset } from './reset-utils';

async function main() {
  try {
    await runReset('fresh');
  } finally {
    await closeResetConnections();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
