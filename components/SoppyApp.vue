<template>
  <div class="SoppyApp">
    <slot></slot>
    <keep-alive v-bind="keepAliveAttrs">
      <component v-bind="viewAttrs" :is="component"></component>
    </keep-alive>
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

    keepAliveAttrs: {
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
    this.isMounted = false;
    SoppyBus.$off('status-401');
    SoppyBus.$off('status-404');
    SoppyBus.$off('status-500');
  },

  methods: {
    getData() {
      let payload = {
        path: this.$route.path,
      };

      if (this.$route.meta && this.$route.meta.soppy) {
        Object.keys(this.$route.meta.soppy).forEach((key) => {
          payload[key] = this.$route.meta.soppy[key];
        });
      }

      this.$store.dispatch('soppy/getData', payload);
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyApp.scss" scoped></style> -->
