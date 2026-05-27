import { Storage, type StorageOptions } from '@google-cloud/storage'
import { env } from '../config'

const options: StorageOptions = {
  projectId: env.GCS_PROJECT_ID,
  ...(process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS }
    : {}),
}

const storage = new Storage(options)
const bucket = storage.bucket(env.GCS_BUCKET_NAME)

export const storageService = {
  async getUploadUrl(fileKey: string, contentType: string) {
    const [url] = await bucket.file(fileKey).getSignedUrl({
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    })
    return url
  },

  async getDownloadUrl(fileKey: string) {
    const [url] = await bucket.file(fileKey).getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000,
    })
    return url
  },

  async downloadFile(fileKey: string): Promise<Buffer> {
    const [buffer] = await bucket.file(fileKey).download()
    return buffer
  },

  async uploadFile(fileKey: string, buffer: Buffer, contentType: string) {
    await bucket.file(fileKey).save(buffer, { contentType })
  }
}