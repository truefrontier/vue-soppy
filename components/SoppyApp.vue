<template>
  <div class="SoppyApp">
    <slot></slot>
    <component v-bind="viewAttrs" :is="component"></component>
    <slot name="after"></slot>
  </div>
</template>

<script>
import SoppyBus from 'vue-soppy/utils/bus';

export default {
  name: 'SoppyApp',

  props: {
    viewNotFound: {
      type: Function,
      default: () => 'router-view',
    },

    viewAttrs: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      component: 'router-view',
    };
  },

  watch: {
    $route: 'getData',
  },

  mounted() {
    SoppyBus.$on('status-404', () => {
      this.component = this.viewNotFound;
    });
  },

  beforeDestroy() {
    SoppyBus.$off('status-404');
  },

  methods: {
    getData() {
      this.$store.dispatch('soppy/getData', { path: this.$route.path });
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyApp.scss" scoped></style> -->
