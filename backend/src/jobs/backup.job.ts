import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { logger } from '@utils/logger';
import { formatDateYYYYMMDD } from '@utils/dateUtils';

const execAsync = promisify(exec);

export async function backupJob(): Promise<void> {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dateStr = formatDateYYYYMMDD(new Date());
    const backupFile = path.join(backupDir, `backup-${dateStr}.sql`);

    const databaseUrl = process.env.DATABASE_URL || '';
    const urlParts = databaseUrl.replace('postgresql://', '').split('@');
    const credentials = urlParts[0].split(':');
    const hostParts = urlParts[1].split('/');
    const host = hostParts[0].split(':')[0];
    const database = hostParts[1].split('?')[0];

    const user = credentials[0];
    const password = credentials[1];

    const command = `PGPASSWORD="${password}" pg_dump -h ${host} -U ${user} -d ${database} -F c -f "${backupFile}"`;

    await execAsync(command);

    const stats = fs.statSync(backupFile);
    logger.info(`Backup completado: ${backupFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    const retentionDays = 30;
    const files = fs.readdirSync(backupDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const fileStats = fs.statSync(filePath);
      const ageDays = (now - fileStats.mtimeMs) / (1000 * 60 * 60 * 24);

      if (ageDays > retentionDays) {
        fs.unlinkSync(filePath);
        logger.info(`Backup antiguo eliminado: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error en backup:', error);
  }
}