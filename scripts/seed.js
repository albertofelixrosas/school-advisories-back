const BASE_URL = 'http://localhost:3000';
const RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 2000; // 2 segundos

async function waitForServer() {
  console.log('🔍 Verificando que el servidor esté disponible...');
  
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
  console.log('💡 Asegúrate de que el servidor esté corriendo con: npm run start:dev');
  return false;
}

async function runSeed() {
  try {
    console.log('🌱 Iniciando proceso de seed...');
    
    // Verificar que el servidor esté disponible
    const serverReady = await waitForServer();
    if (!serverReady) {
      process.exit(1);
    }
    
    // Ejecutar seed
    console.log('📡 Enviando petición de seed al servidor...');
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
    
    console.log('\n🎉 ¡Base de datos inicializada correctamente!');
    console.log('🚀 Puedes empezar a usar tu aplicación con los usuarios de prueba.');
    
  } catch (error) {
    console.error('❌ Error ejecutando seed:');
    
    if (error.message.includes('HTTP')) {
      console.error('   Error del servidor:', error.message);
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      console.error('   No se pudo conectar al servidor');
      console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
    } else {
      console.error('   Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Ejecutar el seed
runSeed();