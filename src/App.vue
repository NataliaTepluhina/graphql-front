<template>
  <div>
    <div>
      <button v-if="!showNewBookForm" @click="showNewBookForm = true">
        Add a new book
      </button>
      <AddBook
        v-if="showNewBookForm"
        :search="searchTerm"
        @closeForm="showNewBookForm = false"
      />
    </div>
    <input type="text" v-model="searchTerm" />
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">Something went wrong! Please try again</p>
    <template v-else>
      <p v-if="activeBook">
        Update "{{ activeBook.title }}" rating:
        <EditRating
          :initial-rating="activeBook.rating"
          :book-id="activeBook.id"
          @closeForm="activeBook = null"
        />
      </p>
      <template v-else>
        <p v-for="book in books" :key="book.id">
          <!-- Let's display rating to see what we're editing -->
          {{ book.title }} - {{ book.rating }}
          <button @click="activeBook = book">Edit rating</button>
        </p>
      </template>
    </template>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useQuery, useResult, useSubscription } from '@vue/apollo-composable'
import allBooksQuery from './graphql/allBooks.query.gql'
import EditRating from './components/EditRating'
import AddBook from './components/AddBook'
import { gql } from '@apollo/client/core'

export default {
  name: 'App',
  components: {
    EditRating,
    AddBook,
  },
  setup() {
    const searchTerm = ref('')
    const activeBook = ref(null)
    const showNewBookForm = ref(false)
    const { result, loading, error } = useQuery(
      allBooksQuery,
      () => ({
        search: searchTerm.value,
      }),
      () => ({
        debounce: 500,
        // enabled: searchTerm.value.length > 2,
      })
    )

    const { result: subResult } = useSubscription(gql`
      subscription bookSubscription {
        bookSub {
          id
          title
          author
          year
          rating
        }
      }
    `)

    watch(
      subResult,
      data => {
        console.log('New book added:', data)
      },
      {
        lazy: true, // Don't immediately execute handler
      }
    )

    const books = useResult(result, [], data => data.allBooks)

    return { books, searchTerm, loading, error, activeBook, showNewBookForm }
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
