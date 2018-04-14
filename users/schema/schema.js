const graphql = require('graphql')
const axios = require('axios')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql

//Defining the schema table similar to knex migrations createTable
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: ()  => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString},
    users: {
      type: new GraphQLList(UserType), //need to use GraphQLList since we are expecting a list of users associated with each company
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(res=> res.data)
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company : {
      type: CompanyType,
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(res => res.data)
      }
    }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    user: {
      type: UserType,
      args: {id: { type: GraphQLString } },
      resolve(parentValue, args){
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data)
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
        .then(resp => resp.data)
      }
    }
  }
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    //describes actions on data object (CRUD)
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },//GraphQLNonNull ensures users must add val
        age: { type: new GraphQLNonNull(GraphQLInt) },//GraphQLNonNull ensures users must add val
        companyId: { type:  GraphQLString }
      },
      resolve(parentValue, { firstName, age }){
        return axios.post('http://localhost:3000/users', { firstName, age } )
          .then(res => res.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString)},
      },
      resolve(parentValue, { id }){
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(res => res.data)
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString)},
        firstName: { type: GraphQLString },//GraphQLNonNull ensures users must add val
        age: { type: GraphQLInt },//GraphQLNonNull ensures users must add val
        companyId: { type:  GraphQLString }
      },
      resolve(parentValue, args){
        return axios.patch(`http://localhost:3000/users/${args.id}`, args)
          .then(res => res.data)
      }
    }
  }
})

// example query in graphiql GUI

// {
//   user(id:"47"){
//     id,
//     firstName,
//     age
//   }
// }

// example addUser mutation query
// mutation{
//   addUser(firstName:"Stephen", age:26){
//     id
//     firstName
//     age
//   }
// }
// example deletUser mutation query

// mutation{
//   deleteUser(id:"23"){
//     id
//   }
// }

// example editUser mutation query
// mutation{
//   editUser(id:"40",firstName:"Bob"){
//     id
//     firstName
//     age
//   }
// }


module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation
})
