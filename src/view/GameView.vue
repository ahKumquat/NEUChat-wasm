<script setup lang="ts">
import {onBeforeMount, onMounted, ref} from "vue";
import {beforeInit, init} from "../script/BlockController";

const audio = ref<HTMLAudioElement>();
const remote = ref<HTMLAudioElement>();
const game = ref<HTMLCanvasElement>();

onMounted(() =>{
  const context = game.value?.getContext("2d")
  const width = game.value?.width;
  const height = game.value?.height;
  init(context, remote, audio, width!, height!);
});

onBeforeMount( () => {
  beforeInit()
});


</script>

<template>
  <div>
    <canvas ref="game" width="640" height="480" style="border: 1px solid black;"></canvas>
    <div>
      <span> Local </span>
      <audio ref="audio" class="audio" controls muted />
    </div>
    <div>
      <span> Remote </span>
      <audio ref="remote" class = "remote" autoplay controls title="remote"/>
    </div>
  </div>
</template>

<style>

canvas {
  background: #f6f6f6;
}


</style>