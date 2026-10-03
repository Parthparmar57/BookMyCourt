import nodemailer from 'nodemailer';
import { env, isMailConfigured } from '../config/env.js';
import { logger } from './logger.js';

// Only build a transporter when SMTP is actually configured; otherwise email is
// cleanly disabled instead of attempting to connect to a fake host.
export const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.debug({ to, subject }, 'Email skipped — SMTP not configured');
    return null;
  }
  try {
    const info = await transporter.sendMail({ from: env.SMTP_FROM, to, subject, text, html });
    logger.info({ messageId: info.messageId }, 'Email sent successfully');
    return info;
  } catch (error) {
    logger.error({ error: error.message, to, subject }, 'Failed to send email');
    return null;
  }
};
