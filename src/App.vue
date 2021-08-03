<template>
  <v-app>    
    <v-main>
      <MinesweeperTables/>
    </v-main>
  </v-app>
</template>

<script>
import MinesweeperTables from './components/MinesweeperTables';

export default {
  name: 'App',

  components: {
    MinesweeperTables,
  },

  data: () => ({
    //
  }),
};
</script>
