const Usuario = require('../models/Usuario')
const bcryptjs = require('bcryptjs')
const resolvers = {
    Query: {

    },
    Mutation: {
        crearUsuario: async (_, { input }, ctx) => {
            const { email, password } = input

            const existeUsuario = await Usuario.findOne({ email })

            // si el usuario existe, muestra en graphql
            if (existeUsuario) {
                throw new Error('El usuario ya está registrado')
            }

            try {

                // Hashear password
                const salt = await bcryptjs.genSalt(10)
                input.password = await bcryptjs.hash(password, salt)
                console.log(input)
                // Registro de nuevo usuario
                const nuevoUsuario = new Usuario(input)
                console.log(nuevoUsuario)

                nuevoUsuario.save()
                return "Usuario Creado Correctamente"
            } catch (error) {
                console.log(error)
            }
        }
    }
}

module.exports = resolvers