import { createServer } from 'vite';

async function startServers() {
  console.log('\n  🚀 Starting Smart Library AI Dual-Port Servers...\n');

  // Main Application Server (Port 3000)
  const mainServer = await createServer({
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  });
  await mainServer.listen();

  // Admin Portal Server (Port 3001)
  const adminServer = await createServer({
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
  });
  await adminServer.listen();

  const mainPort = mainServer.config.server.port || 3000;
  const adminPort = adminServer.config.server.port || 3001;

  console.log('  ┌────────────────────────────────────────────────────────────┐');
  console.log('  │                                                            │');
  console.log('  │   📚  SMART LIBRARY AI - DUAL-PORT DEV SERVERS READY       │');
  console.log('  │                                                            │');
  console.log(`  │   ➜  Main App:      http://localhost:${mainPort}/                    │`);
  console.log(`  │   ➜  Admin Portal:  http://localhost:${adminPort}/                    │`);
  console.log('  │                                                            │');
  console.log('  │   • Unified Login: Enter credentials on either port.       │');
  console.log('  │     Admins route to Library Operations Command.            │');
  console.log('  │     Members route to Member Dashboard.                     │');
  console.log('  │   • Currency: All fines & assessments in INR (₹).          │');
  console.log('  │                                                            │');
  console.log('  └────────────────────────────────────────────────────────────┘\n');

  const shutdown = async () => {
    console.log('\n  Stopping dev servers...');
    await Promise.all([mainServer.close(), adminServer.close()]);
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServers().catch((err) => {
  console.error('Error starting dev servers:', err);
  process.exit(1);
});
