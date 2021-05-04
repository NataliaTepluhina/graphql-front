<template>
  <input
    type="text"
    v-model="rating"
    :disabled="loading"
    @keyup.enter="updateRating"
    @keyup.esc="$emit('closeForm')"
  />
  <p v-if="loading">Updating...</p>
</template>

<script>
import { ref } from 'vue'
import updateBookMutation from '../graphql/updateBook.mutation.gql'
import { useMutation } from '@vue/apollo-composable'
export default {
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

    const { mutate: updateRating, onDone, loading } = useMutation(
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

    return { rating, updateRating, loading }
  },
}
</script>
