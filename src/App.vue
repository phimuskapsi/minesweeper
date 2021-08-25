<template>
  <v-app>
    <GameField />
  </v-app>
</template>

<script>
import GameField from "./components/GameField";

export default {
  name: "App",
  components: {
    GameField
  },
  data: () => ({})
};
</script>
<style>
@font-face {
  font-family: "KarmaticArcade";
  src: url(./fonts/ka1.ttf) format("truetype");
}
</style>
