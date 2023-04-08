import { Type, FastifyPluginAsyncTypebox, Static } from "@fastify/type-provider-typebox"
import { Value } from "@sinclair/typebox/value"
import { allowAnonymousUpload, STORAGE_PATH } from "../../config"
import crypto from "crypto"
import fs from "fs"
import { getFileFromFilename, uploadFile } from "../../database/files"
import { getUserFromApiKey } from "../../database/users"

const uploadFileJsonSchema = Type.Object({
    filename: Type.Optional(Type.String()),
    visibility: Type.Optional(Type.String()),
    expiration: Type.Optional(Type.Number()),

    generateFilename: Type.Optional(Type.Boolean())
})
type UploadFileJsonSchema = Static<typeof uploadFileJsonSchema>

const filesRoutes: FastifyPluginAsyncTypebox = async (fastify, _opts) => {
    fastify.post("/new", async (req, reply) => {
        const file = await req.file()
        if(!file) return reply.status(400).send({error: "MISSING_PARAMS", message: "Missing 'file' field"})
        console.log(file.fields)
        const jsonText = file.fields["json"]
        if(!jsonText) return reply.status(400).send({error: "MISSING_PARAMS", message: "Missing 'json' field"})
        if(!("value" in jsonText) || typeof jsonText.value !== "string") return reply.status(400).send({error: "MISSING_PARAMS", message: "Invalid 'json' field"})
        const json = JSON.parse(jsonText.value)
        if(!Value.Check(uploadFileJsonSchema, json)) return reply.status(400).send({error: "MISSING_PARAMS", message: "Invalid 'json' field"})

        let filename = json.filename || file.filename
        if(!filename) return reply.status(400).send({error: "MISSING_PARAMS", message: "Missing filename"})
        if(filename.includes("/") || filename.includes("\\")) return reply.status(400).send({error: "INVALID_PARAMS", message: "Filename mustn't includes a slash"})
        const visibility = json.visibility || "public"
        if(visibility !== "public" && visibility !== "hidden" && visibility !== "private") return reply.status(400).send({error: "BAD_PARAMS", message: "'visibility' should be 'public', 'hidden' or 'private'"})
        
        let authorId = "_anonymous"
        const key = req.headers.authorization
        if(!key && !allowAnonymousUpload) return reply.status(401).send({error: "UNAUTHORIZED", message: "Missing api key"})
        if(key) {
            const user = await getUserFromApiKey(key)
            if(!user) return reply.status(401).send({error: "UNAUTHORIZED", message: "Invalid api key"})
            authorId = user.id
        }

        const alreadyExisting = await getFileFromFilename(filename)
        if(alreadyExisting) {
            if(json.generateFilename === false) return reply.status(400).send({error: "FILENAME_TAKEN", message: "A file with that name already exists"})
            else {
                let ext = filename.split(".")
                filename = crypto.randomBytes(12).toString("hex")
                if(ext.length === 2) filename += "." + ext.slice(-1)
                else if(ext.length > 2) filename += "." + ext.slice(-2)
            }
        }
        const f = await uploadFile(await file.toBuffer(), {
            filename, visibility, authorId
        })
        reply.send(f)
    })

    fastify.get("/:filename", {
        schema: {
            params: Type.Object({
                filename: Type.String()
            })
        }
    }, async (req, reply) => {
        console.log(req.params)
        const file = await getFileFromFilename(req.params.filename)
        if(!file) return reply.status(404).send({ error: "FILE_NOT_FOUND" })
        const stream = fs.createReadStream(STORAGE_PATH + file.hash)
        return reply.send(stream)
    })
}
export default filesRoutes