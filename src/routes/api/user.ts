import { Type, FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox"
import { getUser, createUser } from "../../database/users.js"

const userRoutes: FastifyPluginAsyncTypebox = async function (fastify, _opts) {
    fastify.get("/:id", {
        schema: {
            params: Type.Object({
                id: Type.String()
            })
        }
    }, async (req, reply) => {
        const user = await getUser(req.params.id)
        if(!user) return reply.status(404).send({ error: "USER_NOT_FOUND" })
        else return user
    })

    fastify.post("/new", {
        schema: {
            body: Type.Object({
                name: Type.String(),
                password: Type.String()
            })
        }
    }, async (req, reply) => {
        const key = req.headers.authorization
        if(!key) return reply.status(401).send({ error: "UNAUTHORIZED" })
        if(key !== process.env.MASTER_KEY) return reply.status(401).send({ error: "UNAUTHORIZED" })
        return await createUser({ name: req.body.name, password: req.body.password })
    })
}
export default userRoutes