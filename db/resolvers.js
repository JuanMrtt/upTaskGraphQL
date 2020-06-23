const Usuario = require('../models/Usuario')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

// Crea y firma un jwt
const crearToken = (usuario, secreta, expiresIn) => {
    const { id, email } = usuario

    return jwt.sign({ id, email }, secreta, { expiresIn })
}
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

                // Registro de nuevo usuario
                const nuevoUsuario = new Usuario(input)

                nuevoUsuario.save()

                return "Usuario Creado Correctamente"

            } catch (error) {
                console.log(error)
            }
        },
        autenticarUsuario: async (_, { input }, ctx) => {
            const { email, password } = input

            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({ email })

            if (!existeUsuario) {
                throw new Error('El usuario no existe')
            }
            // Si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password)

            if (!passwordCorrecto) {
                throw new Error('El password es incorrecto')

            }
            console.log(passwordCorrecto)

            // Dar acceso a la app
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '2hr')
            }
        }
    }
}

module.exports = resolvers