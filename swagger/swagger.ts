import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coupe Jules Rimet API',
      version: '0.0.1',
      description: 'API du site Web de la CJR',
      license: {
        name: 'GPL-3.0-or-later'
      }
    },
    servers: [
      {
        url: '/',
        description: "Racine de l'API"
      }
    ],
    components: {
      securitySchemes: {
        basic: {
          type: 'http',
          scheme: 'basic'
        },
        bearer: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    },
    tags: [
      { name: 'Auth' },
      { name: 'Agenda' },
      { name: 'Schools' },
    ]
  },
  apis: [`${__dirname}/./../src/routers/*.ts`, `${__dirname}/./../build/src/routers/*.js`]
}

export default swaggerJSDoc(options)
