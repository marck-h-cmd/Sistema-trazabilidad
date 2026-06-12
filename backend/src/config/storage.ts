import AWS from 'aws-sdk';
import { config } from './app';

export const s3 = new AWS.S3({
  accessKeyId: config.storage.accessKeyId,
  secretAccessKey: config.storage.secretAccessKey,
  region: config.storage.region,
});

export const bucketName = config.storage.bucket;