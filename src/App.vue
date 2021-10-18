<template>
  <!-- App.vue -->
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
        <section class="list-wrapper">
          <div class="list">
            <h3>All Books</h3>
            <p v-for="book in books" :key="book.id">
              {{ book.title }} - {{ book.rating }}
              <button @click="activeBook = book">Edit rating</button>
              <!-- New button here -->
              <button @click="addBookToFavorites({ book })">
                Add to Favorites
              </button>
            </p>
          </div>
          <div class="list">
            <h3>Favorite Books</h3>
            <p v-for="book in favBooksResult.favoriteBooks" :key="book.id">
              {{ book.title }}
            </p>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
import allBooksQuery from './graphql/allBooks.query.gql'
import EditRating from './components/EditRating.vue'
import AddBook from './components/AddBook.vue'
import bookSubscription from './graphql/newBook.subscription.gql'
import favoriteBooksQuery from './graphql/favoriteBooks.query.gql'
import addBookToFavoritesMutation from './graphql/addBookToFavorites.mutation.gql'

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
    const { result, loading, error, subscribeToMore } = useQuery(
      allBooksQuery,
      () => ({
        search: searchTerm.value,
      }),
      () => ({
        debounce: 500,
        // enabled: searchTerm.value.length > 2,
      })
    )

    subscribeToMore(() => ({
      document: bookSubscription,
      updateQuery(previousResult, newResult) {
        const res = {
          allBooks: [
            ...previousResult.allBooks,
            newResult.subscriptionData.data.bookSub,
          ],
        }
        return res
      },
    }))

    const books = useResult(result, [], data => data.allBooks)

    const { result: favBooksResult } = useQuery(favoriteBooksQuery)

    const { mutate: addBookToFavorites } = useMutation(
      addBookToFavoritesMutation
    )

    return {
      books,
      searchTerm,
      loading,
      error,
      activeBook,
      showNewBookForm,
      favBooksResult,
      addBookToFavorites,
    }
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

.list-wrapper {
  display: flex;
  margin: 0 auto;
  max-width: 960px;
}

.list {
  width: 50%;
}
</style>
