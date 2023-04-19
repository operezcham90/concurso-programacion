const { exec } = require('child_process')
const http = require('http')
const fs = require('fs')

const PORT = 80

const servidor = http.createServer(responder)
servidor.listen(PORT)

function responder(solicitud, respuesta) {
    if (solicitud.url === '/' && solicitud.method === 'GET') raiz(respuesta)
    if (solicitud.url === 'gcc/version' && solicitud.method === 'GET') version(respuesta)
}

function raiz(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    const texto = fs.readFileSync('root.html', 'utf8')
    respuesta.end(texto)
}

function version(respuesta) {
    let mensaje = '⛔'
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    exec('gcc --version', (error, exito, fracaso) => {
        if (error) return
        mensaje = exito | fracaso
        const texto = JSON.parse({
            mensaje: mensaje
        })
        respuesta.end(texto)
    })
}