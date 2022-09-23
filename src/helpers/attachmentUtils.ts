import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger("AttachmentsUtils");

// TODO: Implement the fileStogare logic
const S3 = new XAWS.S3({signatureVersion: 'v4'});

const attachmentsBucket: string = process.env.ATTACHMENT_S3_BUCKET;
const signedUrlExpiration: number = Number(process.env.SIGNED_URL_EXPIRATION);

export async function getS3UploadUrl(todoId: string): Promise<string> {
    logger.info("Creating url for todo: ", todoId);

    return S3.getSignedUrl('putObject', {
        Bucket: attachmentsBucket,
        Key: todoId,
        Expires: signedUrlExpiration
    });
}