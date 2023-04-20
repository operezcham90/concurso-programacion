'use strict'

const cp = require('child_process')
const http = require('http')
const fs = require('fs')

const PORT = 80

const servidor = http.createServer(responder)
servidor.listen(PORT)

function responder(solicitud, respuesta) {
    if (solicitud.url === '/' && solicitud.method === 'GET') raiz(respuesta)
    if (solicitud.url === '/favicon.ico' && solicitud.method === 'GET') icono(respuesta)
    if (solicitud.url === '/gcc/version' && solicitud.method === 'GET') version(respuesta)
}

function raiz(respuesta) {
    console.log('raiz')
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    const texto = fs.readFileSync('root.html', 'utf8')
    respuesta.end(texto)
}

function icono(respuesta) {
    console.log('icono')
    respuesta.writeHead(200, { 'Content-Type': 'image/x-icon' })
    const caudal = fs.createReadStream('favicon.ico')
    caudal.pipe(respuesta)
}

function version(respuesta) {
    console.log('version')
    let numero = '⛔'
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    cp.exec('gcc -dumpversion', (error, exito, fracaso) => {
        if (exito) numero = exito.trim()
        const datos = {
            numero
        }
        const texto = JSON.stringify(datos)
        respuesta.end(texto)
    })
}