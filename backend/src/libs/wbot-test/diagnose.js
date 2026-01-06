const baileys = require('baileys');

async function testConnection() {
  console.log('='.repeat(60));
  console.log('TESTE DE CONEXÃO WHATSAPP');
  console.log('='.repeat(60));
  
  return new Promise((resolve) => {
    try {
      // Cria um keystore simples
      const myKeyStore = {
        get: (type, ids) => {
          // console.log('GET', type, ids);
          return {};
        },
        set: (data) => {
          // console.log('SET', Object.keys(data));
        }
      };
      
      const socket = baileys.makeWASocket({
        version: [2, 3000, 101010101],
        printQRInTerminal: true,
        auth: {
          creds: baileys.initAuthCreds(),
          keys: baileys.makeCacheableSignalKeyStore(myKeyStore, console)
        },
        syncFullHistory: false,
        fireInitQueries: false,
      });
      
      let qrReceived = false;
      let timeout = false;
      
      socket.ev.on('connection.update', (update) => {
        console.log(`[${new Date().toLocaleTimeString()}] Status:`, update.connection || 'connecting');
        
        if (update.qr) {
          qrReceived = true;
          console.log('\n' + '✅'.repeat(20));
          console.log('SUCESSO: QR CODE RECEBIDO!');
          console.log('SEU SERVIDOR PODE CONECTAR AO WHATSAPP');
          console.log('✅'.repeat(20) + '\n');
          
          socket.ws?.close();
          if (!timeout) resolve(true);
        }
        
        if (update.connection === 'close') {
          const error = update.lastDisconnect?.error?.output?.statusCode;
          console.log('Conexão fechada, código:', error);
          
          if (!qrReceived && (error === 515 || error === 401 || error === 403)) {
            console.log('\n' + '❌'.repeat(20));
            console.log('FALHA: WHATSAPP BLOQUEOU A CONEXÃO');
            console.log(`Código de erro: ${error}`);
            console.log('❌'.repeat(20) + '\n');
            
            if (!timeout) resolve(false);
          }
        }
      });
      
      // Timeout
      setTimeout(() => {
        if (!qrReceived) {
          timeout = true;
          console.log('\n' + '⏰'.repeat(20));
          console.log('TIMEOUT: WhatsApp não respondeu');
          console.log('Provavelmente bloqueado ou sem internet');
          console.log('⏰'.repeat(20) + '\n');
          
          socket.ws?.close();
          resolve(false);
        }
      }, 35000);
      
    } catch (error) {
      console.log('\n💥 ERRO CRÍTICO:', error.message);
      resolve(false);
    }
  });
}

// Executa o teste
testConnection().then(result => {
  console.log('='.repeat(60));
  console.log('RESULTADO FINAL:', result ? '✅ CONEXÃO PERMITIDA' : '❌ BLOQUEADO');
  console.log('='.repeat(60));
  
  if (result) {
    console.log('\n📝 CONCLUSÃO:');
    console.log('- Seu servidor/conexão está OK');
    console.log('- O problema está na sua implementação');
    console.log('\n🔧 Ações recomendadas:');
    console.log('1. Limpe todas as sessões antigas');
    console.log('2. Use configuração MÍNIMA no wbot.ts');
    console.log('3. Verifique logs detalhados');
  } else {
    console.log('\n🚨 CONCLUSÃO:');
    console.log('- WhatsApp está bloqueando seu IP/servidor');
    console.log('\n🔄 Ações URGENTES:');
    console.log('1. ESPERE 24-48 HORAS (bloqueio temporário)');
    console.log('2. MUDE DE IP (VPN, outra VPS)');
    console.log('3. Use servidor em nuvem diferente');
  }
  
  process.exit(result ? 0 : 1);
});