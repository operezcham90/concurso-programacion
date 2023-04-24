'use strict'

const cp = require('child_process')
const http = require('http')
const fs = require('fs')
const os = require('os')

const puerto = 81
let anfitrion = '0.0.0.0'
const limite = 1000

const problemas = [
    {
        programa: '#include <stdio.h>\n#include <stdlib.h>\nint main(int argc, char *argv[]) {\n    if (argc != 3) {\n        printf("Uso: %s <num1> <num2>\\n", argv[0]);\n        return 1;\n    }\n    int num1 = atoi(argv[1]);\n    int num2 = atoi(argv[2]);\n    int suma = 0;\n    for (int i = 0; i < num1; i++) {\n        suma += 1;\n    }\n    for (int j = 0; j < num2; j++) {\n        suma += 1;\n    }\n    printf("%d\\n", suma);\n    return 0;\n}\n',
        descripcion: 'Este problema consiste en sumar dos números enteros dados y retornar la suma como resultado.',
        casos: [
            {
                entrada: '0 0',
                salida: '0',
                rapidez: 2000,
                lineas: 1000,
                ganador: '0.0.0.0'
            },
            {
                entrada: '1 1',
                salida: '2',
                rapidez: 2000,
                lineas: 1000,
                ganador: '0.0.0.0'
            },
            {
                entrada: '20 15',
                salida: '35',
                rapidez: 2000,
                lineas: 1000,
                ganador: '0.0.0.0'
            },
            {
                entrada: '99002000 16000500',
                salida: '115002500',
                rapidez: 2000,
                lineas: 1000,
                ganador: '0.0.0.0'
            },
            {
                entrada: '100000000 2000000000',
                salida: '2100000000',
                rapidez: 2000,
                lineas: 1000,
                ganador: '0.0.0.0'
            }
        ]
    }
]

const interfaces = os.networkInterfaces()
for (const interfaz in interfaces) {
    for (const detalle of interfaces[interfaz]) {
        if (detalle.family === 'IPv4') {
            anfitrion = detalle.address
        }
    }
}

const servidor = http.createServer(responder)
servidor.listen(puerto, anfitrion)
console.log(`http://${anfitrion}:${puerto}`)

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
    else if (solicitud.url.includes('/programar') && solicitud.method === 'GET')
        programar(solicitud, respuesta)
    else if (solicitud.url === '/problemas/lista' && solicitud.method === 'GET')
        preguntas(respuesta)
    else
        raiz(respuesta)
}

function preguntas(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'application/json' })
    const cadena = JSON.stringify(problemas)
    respuesta.end(cadena)
}

function raiz(respuesta) {
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    const texto = fs.readFileSync('files/problemas.html', 'utf8')
    respuesta.end(texto)
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
            lineas: 0,
            argumentos: programa.argumentos,
            problema: programa.problema,
            caso: programa.caso
        }
        const ejecutable = `/home/d/${datos.ip}.${datos.id}`
        const fuente = `${ejecutable}.c`
        fs.writeFileSync(fuente, programa.codigo)
        datos.lineas = programa.codigo.split(';').length - 1
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
        datos.texto = `Límite de tiempo excedido (${limite} ms)`
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
            if (datos.texto.trim() === problemas[datos.problema].casos[datos.caso].salida) {
                datos.correctitud = '🟩'
                if (datos.tiempo < problemas[datos.problema].casos[datos.caso].rapidez) {
                    problemas[datos.problema].casos[datos.caso].rapidez = datos.tiempo
                    problemas[datos.problema].casos[datos.caso].ganador = datos.ip
                } else if (datos.tiempo === problemas[datos.problema].casos[datos.caso].rapidez) {
                    if (datos.lineas < problemas[datos.problema].casos[datos.caso].lineas) {
                        problemas[datos.problema].casos[datos.caso].lineas = datos.lineas
                        problemas[datos.problema].casos[datos.caso].ganador = datos.ip
                    }
                }
            }
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

function programar(solicitud, respuesta) {
    const componentes = solicitud.url.split('/')
    const problema = +componentes[2]
    const caso = +componentes[3]
    const programa = problemas[problema].programa
    const entrada = problemas[problema].casos[caso].entrada
    respuesta.writeHead(200, { 'Content-Type': 'text/html' })
    const texto = fs.readFileSync('files/programar.html', 'utf8')
        .replace('{{caso}}', caso)
        .replace('{{problema}}', problema)
        .replace('{{programa}}', programa)
        .replace('{{entrada}}', entrada)
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