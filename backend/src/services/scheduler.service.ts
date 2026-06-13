import { initializeScheduler, stopScheduler, getScheduledTasks } from '@jobs/scheduler';
import { logger } from '@utils/logger';

export class SchedulerService {
  start() {
    initializeScheduler();
    logger.info('Servicio de tareas programadas iniciado');
  }

  stop() {
    stopScheduler();
    logger.info('Servicio de tareas programadas detenido');
  }

  getTasks() {
    return getScheduledTasks();
  }
}