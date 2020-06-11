<template>
  <div class="SoppyLoadbar h-1 relative">
    <div
      :class="[
        'absolute top-0 bottom-0 left-0 transition-all',
        widthClass,
        opacityClass,
        durationClass,
        easingClass,
        bgClass,
      ]"
    ></div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'SoppyLoadbar',

  data() {
    return {
      opacityClass: 'opacity-100',
      widthClass: 'w-0',
      durationClass: 'duration-700',
      easingClass: 'ease-out',
      bgClass: 'bg-green-300',
    };
  },

  computed: {
    isLoading() {
      return !this.hasPreloadedData && this.isGettingData;
    },

    hasPreloadedData() {
      return (
        !!this.$store.state.preloadState[this.$route.path] &&
        Object.keys(this.$store.state.preloadState[this.$route.path]).length
      );
    },

    isGettingData() {
      return this.isGetting.indexOf(this.$route.path) !== -1;
    },

    ...mapState('soppy', ['isGetting']),
  },

  watch: {
    isLoading(val, oldVal) {
      if (val) {
        this.opacityClass = 'opacity-100';
        this.widthClass = 'w-gr-4';
      } else {
        this.easingClass = 'ease-in';
        this.widthClass = 'w-full';
        setTimeout(() => {
          this.durationClass = 'duration-300';
          this.opacityClass = 'opacity-0';
        }, 1000);
      }
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyLoadbar.scss" scoped></style> -->
