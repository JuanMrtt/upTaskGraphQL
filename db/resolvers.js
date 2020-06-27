const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const Tarea = require('../models/Tarea')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

// Crea y firma un jwt
const crearToken = (usuario, secreta, expiresIn) => {
    const { id, email, nombre } = usuario

    return jwt.sign({ id, email, nombre }, secreta, { expiresIn })
}

const resolvers = {
    Query: {
        obtenerProyectos: async (_, { }, ctx) => {
            const proyectos = await Proyecto.find({ creador: ctx.usuario.id })

            return proyectos
        },
        obtenerTareas: async (_, { input }, ctx) => {
            const tareas = await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto)

            return tareas
        }
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
        },
        nuevoProyecto: async (_, { input }, ctx) => {
            try {
                const proyecto = new Proyecto(input)
                // Asociar al creador
                proyecto.creador = ctx.usuario.id
                // Guarda en BD
                const resultado = await proyecto.save()
                console.log('resolver:', resultado)
                return resultado
            } catch (error) {
                console.log(error)
            }
        },
        actualizarProyecto: async (_, { id, input }, ctx) => {
            // Revisar si existe el proyecto
            let proyecto = await Proyecto.findById(id)
            if (!proyecto) {
                throw new Error('Proyecto no encontrado')
            }
            // Verificar si la persona es el creador
            console.log(proyecto)
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar')
            }
            // Guardar proyecto
            proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true })
            return proyecto
        },
        eliminarProyecto: async (_, { id }, ctx) => {
            // Revisar si existe el proyecto
            let proyecto = await Proyecto.findById(id)
            if (!proyecto) {
                throw new Error('Proyecto no existe')
            }
            // Verificar si la persona es el creador
            console.log(proyecto)
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar')
            }
            // Eliminar
            await Proyecto.findOneAndDelete({ _id: id })

            return "Proyecto Eliminado"
        },
        nuevaTarea: async (_, { input }, ctx) => {
            try {
                const tarea = new Tarea(input)
                tarea.creador = ctx.usuario.id

                const resultado = await tarea.save()
                return resultado
            } catch (error) {
                console.log(error)
            }
        },
        actualizarTarea: async (_, { id, input, estado }, ctx) => {
            // Si la tarea existe o no
            let tarea = await Tarea.findById(id)
            if (!tarea) {
                throw new Error('Tarea no encontrada')
            }
            // Si la persona que lo edita es el propietario
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar')
            }

            // asignar estado
            input.estado = estado

            // Guardar y retornar la tarea
            tarea = await Tarea.findOneAndUpdate({ _id: id }, input, { new: true })
            return tarea
        },
        eliminarTarea: async (_, { id }, ctx) => {
            // Revisar si existe el proyecto
            let tarea = await Tarea.findById(id)
            if (!tarea) {
                throw new Error('Tarea no encontrada')
            }
            // Verificar si la persona es el creador
            console.log(tarea)
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar')
            }
            // Eliminar
            await Tarea.findOneAndDelete({ _id: id })

            return "Tarea Eliminada"
        },
    }
}

module.exports = resolvers