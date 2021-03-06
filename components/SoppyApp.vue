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
      hasModal: false,
    };
  },

  watch: {
    $route: {
      deep: true,
      handler(val) {
        this.getData(val);
        this.checkForModal(val);
      },
    },

    hasModal(val) {
      if (val) document.body.classList.add('soppy-modal-view');
      else document.body.classList.remove('soppy-modal-view');
    },
  },

  created() {
    this.getData();
  },

  mounted() {
    if (this.isMounted) this.getData();
    this.isMounted = true;

    SoppyBus.$on('status-200', () => {
      this.component = 'router-view';
    });

    SoppyBus.$on('status-201', () => {
      this.component = 'router-view';
    });

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
    SoppyBus.$off('status-200');
    SoppyBus.$off('status-201');
    SoppyBus.$off('status-401');
    SoppyBus.$off('status-404');
    SoppyBus.$off('status-500');
  },

  methods: {
    getData(route) {
      if (!route) route = this.$route;
      let payload = {
        path: route.path,
      };

      if (route.meta && route.meta.soppy) {
        Object.keys(route.meta.soppy).forEach((key) => {
          payload[key] = route.meta.soppy[key];
        });
      }

      this.$store.dispatch('soppy/getData', payload);
    },

    checkForModal(route) {
      if (!route) route = this.$route;
      this.hasModal = !!route.matched[0]?.components?.modal;
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyApp.scss" scoped></style> -->
