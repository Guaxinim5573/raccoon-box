import fastifyMultipart from "@fastify/multipart";
import Fastify, { FastifyInstance } from "fastify"
import { FASTIFY_OPTIONS, FASTIFY_LISTEN_OPTIONS } from "./config"

import userRoutes from "./routes/api/user";
import filesRoutes from "./routes/api/files";

const app: FastifyInstance = Fastify(FASTIFY_OPTIONS)

app.register(fastifyMultipart)
app.register(userRoutes, {
    prefix: "/api/user"
})
app.register(filesRoutes, {
    prefix: "/api/files"
})

;(async () => {
    try {
        await app.listen(FASTIFY_LISTEN_OPTIONS)
        console.log("App listening on port " + FASTIFY_LISTEN_OPTIONS.port)
    } catch(e) {
        app.log.error(e)
        process.exit(1)
    }
})()