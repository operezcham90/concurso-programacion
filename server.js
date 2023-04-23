'use strict'

const cp = require('child_process')
const http = require('http')
const fs = require('fs')
const os = require('os')

const puerto = 81
let anfitrion = '0.0.0.0'
const limite = 1000

const interfaces = os.networkInterfaces()
for (const interfaz in interfaces) {
    for (const detalle of interfaces[interfaz]) {
        console.log(detalle.address)
        console.log(detalle.family)
        if (detalle.family === 'IPv4') {
            anfitrion = detalle.address
        }
    }
}

const servidor = http.createServer(responder)
servidor.listen(puerto, anfitrion)
console.log(`http://${afitrion}:${puerto}`)

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
        probar(solicitud, respuesta)
    else if (solicitud.url === '/matar/servidor' && solicitud.method === 'GET')
        matar(respuesta)
    else
        raiz(respuesta)
}

function matar(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'text/plain' })
    respuesta.end('proceso terminado')
    process.exit(0)
}

function probar(solicitud, respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    let cuerpo = ''
    solicitud.on('data', (pedacito) => {
        cuerpo += pedacito
    })
    solicitud.on('end', () => {
        const programa = JSON.parse(cuerpo)
        const datos = {
            id: Date.now(),
            ip: solicitud.connection.remoteAddress,
            texto: '',
            compilacion: '🟩',
            correctitud: '⬛',
            tiempo: 0,
            argumentos: programa.argumentos
        }
        const ejecutable = `/home/d/${datos.ip}.${datos.id}`
        const fuente = `${ejecutable}.c`
        fs.writeFileSync(fuente, programa.codigo)
        const proceso = cp.spawn('gcc', [fuente, '-o', ejecutable], { detached: true })
        proceso.stderr.on('data', (salida) => {
            datos.texto += salida
        })
        proceso.on('close', (codigo) => {
            if (codigo !== 0) {
                datos.compilacion = '🟥'
                const cadena = JSON.stringify(datos)
                respuesta.end(cadena)
            } else {
                ejecutar(solicitud, respuesta, datos)
            }
        })
    })
}

function ejecutar(solicitud, respuesta, datos) {
    const ejecutable = `/home/d/${datos.ip}.${datos.id}`
    const inicio = Date.now()
    const proceso = cp.spawn(ejecutable, datos.argumentos.split(' '), { detached: true })
    const temporizador = setTimeout(() => {
        proceso.kill()
        datos.correctitud = '🟥'
        datos.tiempo = 1000
        const cadena = JSON.stringify(datos)
        respuesta.end(cadena)
    }, limite)
    proceso.stderr.on('data', (salida) => {
        datos.texto += salida
    })
    proceso.stdout.on('data', (salida) => {
        datos.texto += salida
    })
    proceso.on('close', (codigo) => {
        clearTimeout(temporizador)
        datos.tiempo = Date.now() - inicio
        if (codigo !== 0) {
            datos.correctitud = '🟥'
            const cadena = JSON.stringify(datos)
            respuesta.end(cadena)
        } else {
            //evaluar(solicitud, respuesta, datos)
            const cadena = JSON.stringify(datos)
            respuesta.end(cadena)
        }
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