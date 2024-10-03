<template>
  <div id="app">
    <DanceRoom />
  </div>
</template>

<script>
import DanceRoom from './components/DanceRoom.vue';

export default {
  components: {
    DanceRoom,
  },
};
</script>

<style>
#app {
  text-align: center;
  background-color: #16213e; /* Fundo do app */
  color: #ffffff; /* Cor do texto */
  padding: 20px;
}
</style>
