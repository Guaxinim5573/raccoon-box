import prisma from "./prisma"
import crypto from "crypto"
import fs from "fs"
import { STORAGE_PATH } from "../config"
import { Prisma } from "@prisma/client"

export interface UploadFileOptions {
    filename: string
    visibility?: "public"|"hidden"|"private"
    expiration?: number
    authorId: string
}
export function uploadFile(data: string | Buffer, options: UploadFileOptions) {
    return new Promise<Prisma.FileGetPayload<{}>>(async (r, rj) => {
        const hash = crypto.createHash("sha512").update(data).digest("hex")
        
        const existingFile = await prisma.file.findUnique({ where: { hash } })
        if(existingFile) return r(existingFile)

        fs.writeFile(STORAGE_PATH + hash, data, (err) => {
            if(err) return rj(err)
            prisma.file.create({
                data: {
                    hash,
                    filename: options.filename,
                    visibility: options.visibility || "public",
                    expiration: new Date(options.expiration || Date.now() + 604800000),
                    authorId: options.authorId
                }
            }).then(f => {
                r(f)
            }).catch((err) => {
                fs.rm(STORAGE_PATH + hash, () => {
                    rj(err)
                })
            })
        })
    })
}

export async function getFileFromFilename(filename: string) {
    return await prisma.file.findUnique({ where: { filename } })
}