<template>
  <v-main>
    <v-container>
      <MinesweeperCanvas ref="minesweeper" />      
    </v-container>
  </v-main>
</template>
<style scoped></style>
<script>
import MinesweeperCanvas from "./MinesweeperCanvas";

export default {
  name: "GameField",
  components: {
    MinesweeperCanvas
  }
};
</script>
