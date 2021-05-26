<template>
  <input
    type="text"
    v-model="rating"
    :disabled="loading"
    @keyup.enter="updateRating"
    @keyup.esc="$emit('closeForm')"
  />
  <p v-if="loading">Updating...</p>
  <p v-if="error">{{ error }}</p>
</template>

<script>
import { ref } from 'vue'
import updateBookMutation from '../graphql/updateBook.mutation.gql'
import { useMutation } from '@vue/apollo-composable'
export default {
  emits: ['closeForm'],
  props: {
    initialRating: {
      type: Number,
      required: true,
    },
    bookId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const rating = ref(props.initialRating)

    const { mutate: updateRating, onDone, loading, error } = useMutation(
      updateBookMutation,
      () => ({
        variables: {
          id: props.bookId,
          rating: +rating.value,
        },
      })
    )

    onDone(() => {
      emit('closeForm')
    })

    return { rating, updateRating, loading, error }
  },
}
</script>
