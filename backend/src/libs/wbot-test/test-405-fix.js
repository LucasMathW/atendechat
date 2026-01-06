// test-simple-405.js
const baileys = require('baileys');

async function testConnection() {
  console.log('🔍 Testando conexão com diferentes configurações...\n');
  
  const configs = [
    {
      name: 'Ubuntu Chrome',
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      version: [2, 3000, 1027934701]
    },
    {
      name: 'Windows Edge',
      browser: ['Windows', 'Edge', '120.0.0.0'],
      version: [2, 3000, 101010101]
    },
    {
      name: 'Mac Safari',
      browser: ['MacOS', 'Safari', '16.0'],
      version: [2, 3000, 1027934701]
    },
    {
      name: 'Android WhatsApp',
      browser: ['WhatsApp', 'Android', '2.23.0'],
      version: [2, 2126, 14] // Versão mais antiga
    }
  ];
  
  for (const config of configs) {
    console.log(`Testando: ${config.name}...`);
    
    const result = await testConfig(config);
    
    if (result) {
      console.log(`🎉 ${config.name} FUNCIONOU!\n`);
      console.log('Use esta configuração no seu wbot.ts:');
      console.log(JSON.stringify(config, null, 2));
      return config;
    }
    
    console.log(`❌ ${config.name} falhou\n`);
    await new Promise(r => setTimeout(r, 3000)); // Espera entre testes
  }
  
  console.log('😞 Nenhuma configuração funcionou');
  return null;
}

function testConfig(config) {
  return new Promise((resolve) => {
    try {
      const socket = baileys.makeWASocket({
        version: config.version,
        printQRInTerminal: false,
        auth: {
          creds: baileys.initAuthCreds(),
          keys: baileys.makeCacheableSignalKeyStore({
            get: () => ({}),
            set: () => {}
          }, console)
        },
        browser: config.browser,
        syncFullHistory: false,
        fireInitQueries: false
      });
      
      socket.ev.on('connection.update', (update) => {
        if (update.qr) {
          console.log('   ✅ QR code gerado!');
          socket.ws?.close();
          resolve(true);
        }
        
        if (update.connection === 'close') {
          const code = update.lastDisconnect?.error?.output?.statusCode;
          if (code === 405) {
            console.log(`   ❌ Erro 405 com ${config.name}`);
            socket.ws?.close();
            resolve(false);
          }
        }
      });
      
      setTimeout(() => {
        socket.ws?.close();
        resolve(false);
      }, 15000);
      
    } catch (error) {
      console.log(`   💥 Erro: ${error.message}`);
      resolve(false);
    }
  });
}

// Executa o teste
testConnection().then(workingConfig => {
  console.log('\n' + '='.repeat(60));
  if (workingConfig) {
    console.log('✅ CONFIGURAÇÃO FUNCIONAL ENCONTRADA!');
  } else {
    console.log('❌ Tente estas soluções:');
    console.log('1. Execute: npm update baileys');
    console.log('2. Espere 1-2 horas (bloqueio temporário)');
    console.log('3. Mude o IP do servidor');
  }
  console.log('='.repeat(60));
});