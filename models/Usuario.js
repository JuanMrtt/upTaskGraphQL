const mongoose = require('mongoose')

const UsuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true // Quita espacios al principio o final
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    registro: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Usuario', UsuarioSchema)