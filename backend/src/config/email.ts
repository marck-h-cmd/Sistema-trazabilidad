import nodemailer from 'nodemailer';
import { config } from './app';

export const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const emailDefaults = {
  from: `"${config.email.fromName}" <${config.email.from}>`,
};