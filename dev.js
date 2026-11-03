import { createServer } from 'vite';

async function startServers() {
  console.log('\n  🚀 Starting Smart Library AI Server on Port 3000...\n');

  // Main Application Server (Port 3000)
  const mainServer = await createServer({
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  });
  await mainServer.listen();

  const mainPort = mainServer.config.server.port || 3000;

  console.log('  ┌────────────────────────────────────────────────────────────┐');
  console.log('  │                                                            │');
  console.log('  │   📚  SMART LIBRARY AI - DEV SERVER READY                  │');
  console.log('  │                                                            │');
  console.log(`  │   ➜  App URL:       http://localhost:${mainPort}/                    │`);
  console.log('  │                                                            │');
  console.log('  │   • Role-based access:                                     │');
  console.log('  │     Admins route to Library Operations Command.            │');
  console.log('  │     Members route to Member Dashboard.                     │');
  console.log('  │   • Currency: All fines & assessments in INR (₹).          │');
  console.log('  │                                                            │');
  console.log('  └────────────────────────────────────────────────────────────┘\n');

  const shutdown = async () => {
    console.log('\n  Stopping dev server...');
    await mainServer.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServers().catch((err) => {
  console.error('Error starting dev server:', err);
  process.exit(1);
});
