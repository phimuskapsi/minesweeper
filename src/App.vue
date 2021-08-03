<template>
  <v-app>    
    <v-main>
      <Minesweeper/>
    </v-main>
  </v-app>
</template>

<script>
import Minesweeper from './components/Minesweeper';

export default {
  name: 'App',

  components: {
    Minesweeper,
  },

  data: () => ({
    //
  }),
};
</script>
