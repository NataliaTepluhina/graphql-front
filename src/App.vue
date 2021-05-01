<template>
  <div>
    <input type="text" v-model="searchTerm" />
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">Something went wrong! Please try again</p>
    <template v-else>
      <p v-for="book in books" :key="book.id">
        {{ book.title }}
        <button @click="activeBook = book">Edit rating</button>
      </p>
      <p v-if="activeBook">
        Update "{{ activeBook.title }}" rating:
        <EditRating :initial-rating="activeBook.rating" />
      </p>
    </template>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useQuery, useResult } from '@vue/apollo-composable'
import allBooksQuery from './graphql/allBooks.query.gql'
import EditRating from './components/EditRating'

export default {
  name: 'App',
  components: {
    EditRating,
  },
  setup() {
    const searchTerm = ref('')
    const activeBook = ref(null)
    const { result, loading, error } = useQuery(
      allBooksQuery,
      () => ({
        search: searchTerm.value,
      }),
      () => ({
        debounce: 500,
        enabled: searchTerm.value.length > 2,
      })
    )

    const books = useResult(result, [], data => data.allBooks)

    return { books, searchTerm, loading, error, activeBook }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
