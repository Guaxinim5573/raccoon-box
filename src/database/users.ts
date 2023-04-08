import crypto from "crypto"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

const generateApiKey = async () => {
    return crypto.randomBytes(32).toString("hex")
}

export interface CreateUserOptions {
    name: string
    password: string
}
export async function createUser(data: CreateUserOptions) {
    const id = crypto.randomBytes(8).toString("hex").toUpperCase()
    const apiKey = await generateApiKey()
    const hashedPassword = await bcrypt.hash(data.password, 10)
    return await prisma.user.create({
        data: {
            id, apiKey,
            name: data.name,
            password: hashedPassword
        }
    })
}

export async function getUser(id: string) {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            createdAt: true,
            name: true
        }
    })
}

export async function getUserFromApiKey(apiKey: string) {
    return await prisma.user.findUnique({
        where: { apiKey },
        select: {
            id: true,
            createdAt: true,
            name: true
        }
    })
}