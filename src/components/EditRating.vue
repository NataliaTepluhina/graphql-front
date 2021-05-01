<template>
  <input type="text" v-model="rating" @keyup.enter="updateRating" />
</template>

<script>
import { ref, watch } from 'vue'
export default {
  props: {
    initialRating: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const rating = ref(props.initialRating)

    watch(
      () => props.initialRating,
      () => {
        rating.value = props.initialRating
      }
    )

    const updateRating = () => {
      console.log(rating.value)
    }

    return { rating, updateRating }
  },
}
</script>
