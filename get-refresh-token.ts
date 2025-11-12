/**
 * Script para obtener refresh token de Gmail API
 * Uso: npx ts-node get-refresh-token.ts
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

async function getRefreshToken() {
  console.log('🔑 Obteniendo refresh token para Gmail API...\n');

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ CLIENT_ID o CLIENT_SECRET no encontrados en .env');
    return;
  }

  console.log(`📋 Usando Client ID: ${CLIENT_ID}`);

  // Configurar OAuth2 client
  const oauth2Client = new google.auth.OAuth2({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/gmail/callback',
  });

  // Scopes necesarios para Gmail
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  // Generar URL de autorización
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Fuerza mostrar pantalla de consentimiento
  });

  console.log('\n📱 INSTRUCCIONES:');
  console.log('1. Abre esta URL en tu navegador:');
  console.log(`   ${authUrl}`);
  console.log('\n2. Autoriza la aplicación con tu cuenta de Gmail');
  console.log('3. Copia el código de autorización que aparece');
  console.log('4. Pégalo aquí cuando se te solicite\n');

  // Esperar el código del usuario
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise<string>((resolve) => {
    rl.question('📝 Pega el código de autorización aquí: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  try {
    console.log('\n🔄 Intercambiando código por tokens...');

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      console.log('\n✅ ¡Refresh token obtenido exitosamente!');
      console.log('\n📋 Copia esta línea a tu archivo .env:');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

      console.log(
        '\n🔧 O ejecuta este comando para actualizarlo automáticamente:',
      );
      console.log(
        `echo "GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}" >> .env`,
      );

      console.log('\n🧪 Después ejecuta: npx ts-node test-gmail-simple.ts');
    } else {
      console.log(
        '⚠️  No se obtuvo refresh token. Esto puede pasar si ya tenías autorización previa.',
      );
      console.log(
        '💡 Revoca el acceso en: https://myaccount.google.com/permissions',
      );
      console.log('   Y vuelve a ejecutar este script.');
    }
  } catch (error) {
    console.error('\n❌ Error al intercambiar código por tokens:');
    console.error(error.message);

    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 El código puede haber expirado. Intenta nuevamente.');
    }

    if (error.message.includes('unauthorized_client')) {
      console.log('\n💡 Verifica que:');
      console.log('1. El Client ID y Client Secret sean correctos');
      console.log(
        '2. https://developers.google.com/oauthplayground esté en Redirect URIs',
      );
      console.log('3. Gmail API esté habilitada en Google Cloud Console');
    }
  }
}

void getRefreshToken();
