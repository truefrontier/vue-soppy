<template>
  <div class="SoppyApp">
    <slot></slot>
    <component v-bind="viewAttrs" :is="component"></component>
    <router-view name="modal"></router-view>
    <slot name="after"></slot>
  </div>
</template>

<script>
import SoppyBus from '../utils/bus';

export default {
  name: 'SoppyApp',

  props: {
    viewNotFound: {
      type: Function,
      default: () => 'router-view',
    },

    viewServerError: {
      type: Function,
      default: () => 'router-view',
    },

    viewUnauthorized: {
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
      isMounted: false,
    };
  },

  watch: {
    $route: 'getData',
  },

  created() {
    this.getData();
  },

  mounted() {
    if (this.isMounted) this.getData();
    this.isMounted = true;

    SoppyBus.$on('status-401', () => {
      this.component = this.viewUnauthorized;
    });

    SoppyBus.$on('status-404', () => {
      this.component = this.viewNotFound;
    });

    SoppyBus.$on('status-500', () => {
      this.component = this.viewServerError;
    });
  },

  beforeDestroy() {
    SoppyBus.$off('status-401');
    SoppyBus.$off('status-404');
    SoppyBus.$off('status-500');
  },

  methods: {
    getData() {
      this.$store.dispatch('soppy/getData', {
        path: this.$route.meta.soppyPath || this.$route.path,
      });
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyApp.scss" scoped></style> -->
