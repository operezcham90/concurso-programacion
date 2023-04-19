'use strict'

const cp = require('child_process')
const http = require('http')
const fs = require('fs')

const PORT = 80

const servidor = http.createServer(responder)
servidor.listen(PORT)

function responder(solicitud, respuesta) {
    if (solicitud.url === '/' && solicitud.method === 'GET') raiz(respuesta)
    if (solicitud.url === '/gcc/version' && solicitud.method === 'GET') version(respuesta)
}

function raiz(respuesta) {
    console.log('raiz')
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    const texto = fs.readFileSync('root.html', 'utf8')
    respuesta.end(texto)
}

function version(respuesta) {
    console.log('version')
    let mensaje = '⛔'
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    cp.exec('gcc --version', (error, exito, fracaso) => {
        if (exito) mensaje = exito
        const texto = JSON.parse({
            mensaje: mensaje
        })
        respuesta.end(texto)
    })
}