<template>
  <div class="SoppyLoadbar h-1 relative">
    <div
      :class="[
        'absolute top-0 bottom-0 left-0 transition-all',
        opacityClass,
        durationClass,
        easingClass,
        loadbarClass,
      ]"
      :style="style"
    ></div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'SoppyLoadbar',

  props: {
    loadbarClass: {
      type: String,
      default: 'bg-green-300',
    },

    hideAfter: {
      type: Number,
      default: 500,
    },
  },

  data() {
    return {
      opacityClass: 'opacity-100',
      width: 0,
      widthInterval: 0,
      durationClass: 'duration-700',
      easingClass: 'ease-out',
    };
  },

  computed: {
    style() {
      return {
        width: `${this.width}%`,
      };
    },

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
      const updateWidth = () => {
        if (this.width < 38.2) {
          this.width = this.width * 1.618;
        } else {
          let newWidth = 100 - (100 - this.width) / 1.618;
          this.width = newWidth > 91 ? Math.min(99, this.width + 0.15) : newWidth;
        }
      };

      if (val) {
        this.opacityClass = 'opacity-100';
        this.width = this.width || 1;
        this.widthInterval = setInterval(updateWidth, 60);
      } else {
        clearInterval(this.widthInterval);
        this.easingClass = 'ease-in';
        this.width = 100;
        this.$nextTick(() => {
          setTimeout(() => {
            this.opacityClass = 'opacity-0';
          }, this.hideAfter);
        });
      }
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyLoadbar.scss" scoped></style> -->
