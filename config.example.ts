// Copy this file to `src/config.ts` then edit it
import { FastifyListenOptions } from "fastify"

/**
 * Directory to store files
 * Make sure to end with "/"
 */
export const STORAGE_PATH = "./files/"

/**
 * Allow users without an api key to upload files
 */
export const allowAnonymousUpload = false
/**
 * Allow anyone to create an account
 */
export const allowAnonymousCreateUser = false

/**
 * Blacklist of mimetypes
 */
export const mimeBlacklist = [
    "application/x-dosexec",
    "application/x-executable",
    "application/x-sharedlib",
    "application/x-hdf5",
    "application/java-archive",
    "application/vnd.android.package-archive",
    "application/x-rar",
    "application/vnd.microsoft.portable-executable"
]

export const FASTIFY_OPTIONS = {
    logger: true
}

export const FASTIFY_LISTEN_OPTIONS: FastifyListenOptions = {
    host: "0.0.0.0",
    port: 3000
}