import { transporter, emailDefaults } from '@config/email';
import { logger } from '@utils/logger';

export async function sendEmail(to: string | string[], subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      ...emailDefaults,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });
    logger.info(`Email enviado a ${Array.isArray(to) ? to.join(', ') : to}: ${subject}`);
  } catch (error) {
    logger.error('Error enviando email:', error);
    throw error;
  }
}

export async function sendScheduledReport(
  recipients: string[],
  reportName: string,
  reportType: string,
  reportData: any
): Promise<void> {
  const html = `
    <h2>${reportName}</h2>
    <p>Tipo de reporte: ${reportType}</p>
    <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
    <hr />
    <pre>${JSON.stringify(reportData, null, 2)}</pre>
  `;

  for (const recipient of recipients) {
    try {
      await sendEmail(recipient, `${reportName} - ${new Date().toLocaleDateString('es-ES')}`, html);
    } catch (error) {
      logger.error(`Error enviando reporte a ${recipient}:`, error);
    }
  }
}