'use strict'

const cp = require('child_process')
const http = require('http')
const fs = require('fs')

const puerto = 81
const anfitrion = '0.0.0.0'

const servidor = http.createServer(responder)
servidor.listen(puerto, anfitrion)

function responder(solicitud, respuesta) {
    if (solicitud.url === '/water.css' && solicitud.method === 'GET')
        estilos(respuesta, '💧')
    else if (solicitud.url === '/codemirror.css' && solicitud.method === 'GET')
        estilos(respuesta, '🐚')
    else if (solicitud.url === '/lesser-dark.css' && solicitud.method === 'GET')
        estilos(respuesta, '🎨')
    else if (solicitud.url === '/clike.js' && solicitud.method === 'GET')
        rutinas(respuesta, '🔨')
    else if (solicitud.url === '/codemirror.js' && solicitud.method === 'GET')
        rutinas(respuesta, '🐚')
    else if (solicitud.url === '/favicon.ico' && solicitud.method === 'GET')
        icono(respuesta)
    else if (solicitud.url === '/gcc/version' && solicitud.method === 'GET')
        version(respuesta)
    else if (solicitud.url === '/ip/direccion' && solicitud.method === 'GET')
        direccion(solicitud, respuesta)
    else if (solicitud.url === '/gcc/ejecutar' && solicitud.method === 'POST')
        ejecutar(solicitud, respuesta)
    else if (solicitud.url === '/matar/servidor' && solicitud.method === 'GET')
        matar(respuesta)
    else
        raiz(respuesta)
}

function matar(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'text/plain' })
    respuesta.end('💀')
    process.exit(0)
}

function ejecutar(solicitud, respuesta) {
    let datos = ''
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    solicitud.on('data', (pedacito) => {
        datos += pedacito
    })
    solicitud.on('end', () => {
        const programa = JSON.parse(datos)
        const id = Date.now()
        const fuente = '/home/serv/dump/' + id + '.c'
        const ejecutable = '/home/serv/dump/' + id
        fs.writeFileSync(fuente, programa.codigo)
        const comando = `gcc ${fuente} -o ${ejecutable} && ${ejecutable} ${programa.argumentos}`
        cp.exec(comando, (error, exito, fracaso) => {
            let texto = ''
            let compilacion = '🟩'
            let correctitud = '⬛'
            if (error) {
                texto = error
                compilacion = '⬛'
            }
            if (fracaso) {
                texto = fracaso
                compilacion = '🟥'
            }
            if (exito) texto = exito
            const datos = {
                texto,
                compilacion,
                correctitud
            }
            const cadena = JSON.stringify(datos)
            respuesta.end(cadena)
        })
    })
}

function rutinas(respuesta, marca) {
    respuesta.writeHead(200, { 'Content-Type': 'application/javascript' })
    let archivo = 'files/water.min.css'
    if (marca === '🔨') archivo = 'files/clike.min.js'
    if (marca === '🐚') archivo = 'files/codemirror.min.js'
    const texto = fs.readFileSync(archivo, 'utf8')
    respuesta.end(texto)
}

function estilos(respuesta, marca) {
    respuesta.writeHead(200, { 'Content-Type': 'text/css' })
    let archivo = 'files/water.min.css'
    if (marca === '💧') archivo = 'files/water.min.css'
    if (marca === '🐚') archivo = 'files/codemirror.min.css'
    if (marca === '🎨') archivo = 'files/lesser-dark.css'
    const texto = fs.readFileSync(archivo, 'utf8')
    respuesta.end(texto)
}

function raiz(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    const texto = fs.readFileSync('files/root.html', 'utf8')
    respuesta.end(texto)
}

function icono(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'image/x-icon' })
    const caudal = fs.createReadStream('files/favicon.ico')
    caudal.pipe(respuesta)
}

function version(respuesta) {
    let numero = '0.0.0'
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

function direccion(solicitud, respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    const ip = solicitud.connection.remoteAddress
    const datos = {
        ip
    }
    const texto = JSON.stringify(datos)
    respuesta.end(texto)
}