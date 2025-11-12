import { google } from 'googleapis';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testGmailOnly() {
  console.log('🚀 Verificando configuración de Gmail API...\n');

  try {
    // Verificar variables de entorno
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.log('❌ Variables de entorno faltantes:');
      missingVars.forEach((varName) => console.log(`   - ${varName}`));
      console.log('\n📋 Pasos para configurar:');
      console.log('1. Copia .env.example a .env');
      console.log('2. Completa las variables faltantes');
      console.log(
        '3. Obtén el refresh token visitando: http://localhost:3000/auth/gmail',
      );
      return;
    }

    console.log('✅ Variables de entorno encontradas');

    // Inicializar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    console.log('✅ Cliente OAuth2 inicializado');

    // Verificar conexión con Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    console.log('🔍 Verificando conexión con Gmail API...');
    const profile = await gmail.users.getProfile({ userId: 'me' });

    console.log('✅ Conexión exitosa con Gmail API');
    console.log(`📧 Email configurado: ${profile.data.emailAddress}`);
    console.log(`📊 Total de mensajes: ${profile.data.messagesTotal}`);

    // Enviar email de prueba
    console.log('\n📨 Enviando email de prueba...');

    const testEmail = process.env.FROM_EMAIL || profile.data.emailAddress;

    const emailMessage = [
      `To: ${testEmail}`,
      `From: "${process.env.FROM_NAME || 'Sistema de Asesorías'}" <${process.env.FROM_EMAIL || profile.data.emailAddress}>`,
      'Subject: 🧪 Prueba Gmail API - Sistema de Asesorías',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .success { color: #4CAF50; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧪 Prueba Gmail API</h1>
          <h2>Sistema de Asesorías</h2>
        </div>
        
        <div class="content">
          <p class="success">✅ ¡Gmail API configurado correctamente!</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
          <p><strong>Email configurado:</strong> ${profile.data.emailAddress}</p>
          <p><strong>Refresh token:</strong> Válido ✅</p>
          
          <h3>🎯 Funcionalidades disponibles:</h3>
          <ul>
            <li>✅ Envío de emails automático</li>
            <li>✅ Notificaciones de solicitudes</li>
            <li>✅ Confirmaciones de asesorías</li>
            <li>✅ Recordatorios</li>
          </ul>
        </div>
      </body>
      </html>
      `,
    ].join('\r\n');

    const encodedMessage = Buffer.from(emailMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    if (result.data.id) {
      console.log('🎉 ¡EMAIL ENVIADO EXITOSAMENTE!');
      console.log(`📧 Message ID: ${result.data.id}`);
      console.log('\n✅ CONFIGURACIÓN COMPLETA');
      console.log('🚀 Gmail API está funcionando correctamente');
      console.log(`📨 Revisa tu bandeja: ${testEmail}`);
      console.log('\n🔧 Para usar en la aplicación:');
      console.log('1. Asegúrate de que la base de datos esté corriendo');
      console.log('2. Inicia el servidor: npm run start:dev');
      console.log('3. El sistema enviará emails automáticamente');
    }
  } catch (error) {
    console.error('\n❌ Error durante la prueba:');
    console.error(error.message);

    console.error(JSON.stringify(error, null, 2));

    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Solución:');
      console.log('El refresh token puede haber expirado.');
      console.log(
        'Obtén uno nuevo visitando: http://localhost:3000/auth/gmail',
      );
    }

    if (error.message.includes('invalid_client')) {
      console.log('\n💡 Solución:');
      console.log('Verifica GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET');
    }
  }
}

// Ejecutar la prueba
void testGmailOnly();
