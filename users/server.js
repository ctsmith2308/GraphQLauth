const express = require('express')
const expressGraphQL = require('express-graphql')
const schema = require('./schema/schema')

const app = express()

app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true // dev tool used to make queries in dev env
}))

app.listen(4000, () => {
  console.log('Listening');
})
