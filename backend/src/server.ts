import * as path from 'path';
import * as moduleAlias from 'module-alias';

// Register module aliases with absolute paths
const backendRoot = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '@config': path.join(backendRoot, 'dist/config'),
  '@controllers': path.join(backendRoot, 'dist/controllers'),
  '@services': path.join(backendRoot, 'dist/services'),
  '@routes': path.join(backendRoot, 'dist/routes'),
  '@middleware': path.join(backendRoot, 'dist/middleware'),
  '@utils': path.join(backendRoot, 'dist/utils'),
  '@customTypes': path.join(backendRoot, 'dist/types'),
  '@repositories': path.join(backendRoot, 'dist/repositories'),
  '@queues': path.join(backendRoot, 'dist/queues'),
  '@events': path.join(backendRoot, 'dist/events'),
  '@jobs': path.join(backendRoot, 'dist/jobs'),
  '@websocket': path.join(backendRoot, 'dist/websocket')
});

import app from './app';
import { config } from '@config/app';
import { logger } from '@utils/logger';
import { prisma } from '@config/database';

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('📦 Base de datos conectada exitosamente');

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${config.port} [${config.nodeEnv}]`);
      logger.info(`📚 API: http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`❤️  Health: http://localhost:${config.port}/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} recibido. Cerrando gracefulmente...`);

      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Base de datos desconectada');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Cierre forzado después de timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Error no capturado:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Promesa rechazada no manejada:', reason);
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();