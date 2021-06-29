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

const apolloClient = new ApolloClient({
  link,
  cache,
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.mount('#app')
