<template>
  <v-app>    
    <v-main>
      <v-container>
      
        
            <MinesweeperCanvas ref="minesweeper"/>
                     
        
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import MinesweeperCanvas from './components/MinesweeperCanvas';

export default {
  name: 'App',

  components: {
    MinesweeperCanvas,
  },

  data: () => ({

  }),
  
};
</script>
