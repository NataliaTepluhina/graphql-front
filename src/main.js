import { createApp, h, provide } from 'vue'
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core'
import { WebSocketLink } from '@apollo/client/link/ws'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { getMainDefinition } from '@apollo/client/utilities'
import typeDefs from './graphql/typedefs.gql'
import favoriteBooksQuery from './graphql/favoriteBooks.query.gql'

import App from './App.vue'

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
})

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
  },
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const cache = new InMemoryCache()

cache.writeQuery({
  query: favoriteBooksQuery,
  data: {
    favoriteBooks: [
      {
        __typename: 'Book',
        title: 'My Book',
        id: 123,
        rating: 5,
      },
    ],
  },
})

const resolvers = {
  Mutation: {
    addBookToFavorites: (_, { book }, { cache }) => {
      const data = cache.readQuery({ query: favoriteBooksQuery })
      const newData = {
        favoriteBooks: [...data.favoriteBooks, book],
      }
      cache.writeQuery({ query: favoriteBooksQuery, data: newData })
      return newData.favoriteBooks
    },
  },
}

const apolloClient = new ApolloClient({
  link,
  cache,
  typeDefs,
  resolvers,
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.mount('#app')
