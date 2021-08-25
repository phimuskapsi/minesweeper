<template>
  <v-navigation-drawer permanent fixed>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="text-h6">
          Minehunter
        </v-list-item-title>
        <v-list-item-subtitle>
          v0.4
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        link
        v-on:click="handleClick(item.fn)"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
export default {
  name: "GameMenu",
  data: () => ({
    items: [
      {
        title: "Start Game",
        icon: "mdi-play-arrow",
        color: "primary",
        visible: true,
        fn: "startGame"
      },
      {
        title: "Settings",
        icon: "mdi-settings",
        color: "white",
        visible: true,
        fn: "openSettings"
      },
      { title: "Scores", icon: "mdi-score", color: "white", visible: true },
      {
        title: "Solve",
        icon: "mdi-checkmark",
        color: "orange",
        visible: false,
        fn: "solveGame"
      }
    ]
  }),
  methods: {
    handleClick(fn) {
      this[fn]();
    },
    openSettings() {
      this.$emit("openSettingsClick");
    },
    solveGame() {
      this.$emit("solveGameClick");
    },
    startGame() {
      this.$emit("startGameClick", true);
    }
  }
};
</script>
