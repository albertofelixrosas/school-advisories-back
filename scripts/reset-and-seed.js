const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 3000; // 3 segundos

async function waitForServer() {
  console.log('🔍 Esperando que el servidor esté disponible...');
  
  for (let i = 0; i < RETRY_ATTEMPTS; i++) {
    try {
      const response = await fetch(`${BASE_URL}/seed/users`);
      if (response.ok) {
        console.log('✅ Servidor disponible!');
        return true;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.log(`⏳ Intento ${i + 1}/${RETRY_ATTEMPTS} - Esperando servidor...`);
      if (i < RETRY_ATTEMPTS - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  console.error('❌ No se pudo conectar al servidor después de varios intentos');
  return false;
}

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando servidor NestJS...');
    
    const serverProcess = spawn('npm', ['run', 'start:dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });
    
    let serverReady = false;
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Buscar indicadores de que el servidor está listo
      if (output.includes('Nest application successfully started') || 
          output.includes('Server running at')) {
        serverReady = true;
        resolve(serverProcess);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    serverProcess.on('close', (code) => {
      if (!serverReady) {
        reject(new Error(`Servidor terminó con código ${code}`));
      }
    });
    
    // Timeout después de 60 segundos
    setTimeout(() => {
      if (!serverReady) {
        serverProcess.kill();
        reject(new Error('Timeout esperando que el servidor inicie'));
      }
    }, 60000);
  });
}

async function runSeed() {
  try {
    console.log('📡 Enviando petición de seed...');
    const response = await fetch(`${BASE_URL}/seed/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Seed ejecutado exitosamente!');
    console.log('📊 Resultado:', data.message);
    console.log('👥 Usuarios creados:', data.data.users);
    
    if (data.credentials) {
      console.log('\n🔑 Credenciales de prueba:');
      Object.entries(data.credentials).forEach(([role, creds]) => {
        console.log(`  ${role}: ${creds.username} / ${creds.password}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error.message);
    return false;
  }
}

async function resetAndSeed() {
  let serverProcess = null;
  
  try {
    console.log('🔄 Iniciando proceso completo de reset y seed...\n');
    
    // 1. Iniciar servidor
    serverProcess = await startServer();
    console.log('✅ Servidor iniciado correctamente\n');
    
    // 2. Esperar a que esté completamente listo
    const serverReady = await waitForServer();
    if (!serverReady) {
      throw new Error('Servidor no disponible');
    }
    
    // 3. Ejecutar seed
    const seedSuccess = await runSeed();
    if (!seedSuccess) {
      throw new Error('Fallo en el seed');
    }
    
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('🚀 Tu aplicación está lista con datos de prueba.');
    console.log('⚠️  El servidor sigue corriendo. Presiona Ctrl+C para detenerlo.');
    
    // Mantener el proceso vivo para que el servidor no se cierre
    process.on('SIGINT', () => {
      console.log('\n👋 Cerrando servidor...');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(0);
    });
    
    // Esperar indefinidamente
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    
    if (serverProcess) {
      console.log('🛑 Cerrando servidor...');
      serverProcess.kill();
    }
    
    process.exit(1);
  }
}

// Ejecutar reset y seed
resetAndSeed();