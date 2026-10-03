import nodemailer from 'nodemailer';
import { env, isMailConfigured } from '../config/env.js';
import { logger } from './logger.js';

// Transporter instance when SMTP is configured
export const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return null;

  if (!transporter) {
    logger.info({ to, subject }, '📧 [EMAIL DISPATCHED - SIMULATION] SMTP not configured. Email logged in console.');
    console.log(`\n================== 📧 OUTGOING EMAIL ==================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    if (text) console.log(`TEXT: ${text}`);
    console.log(`STATUS: Delivered (Simulated Dev Mode)`);
    console.log(`=======================================================\n`);
    return { success: true, simulated: true, to, subject };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME || 'The Champions Club'}" <${env.SMTP_FROM}>`,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      html,
    });
    logger.info({ messageId: info.messageId, to, subject }, 'Email sent successfully via SMTP');
    return { success: true, messageId: info.messageId, to, subject };
  } catch (error) {
    logger.error({ error: error.message, to, subject }, 'Failed to send email via SMTP');
    return { success: false, error: error.message };
  }
};

