const { gql } = require('apollo-server')

const typeDefs = gql`

    type Curso {
        titulo: String    
    }
    
    type Tecnologia {
        tecnologia: String
    }

    type Proyecto {
        nombre: String
        id: ID
    }

    type Token {
        token: String
    }

    type Query {
        obtenerCursos: [Curso]
        obtenerTecnologia: [Tecnologia]
    }

    input UsuarioInput {
        nombre: String!
        email: String!
        password: String!
    }
    input AutenticarInput {
        email: String!
        password: String!
    }
    input ProyectoInput {
        nombre: String!
    }
    type Mutation {
        crearUsuario(input: UsuarioInput): String
        autenticarUsuario(input: AutenticarInput): Token
        nuevoProyecto(input: ProyectoInput): Proyecto
        actualizarProyecto(id: ID!, input: ProyectoInput): Proyecto
    }
`

module.exports = typeDefs