<template>
  <router-link :to="to" @mouseenter.native="onMouseenter" @click.native="onClick">
    <slot></slot>
  </router-link>
</template>

<script>
export default {
  name: 'SoppyLink',

  props: {
    to: String,

    forcePreload: {
      type: Boolean,
      default: false,
    },

    disablePreload: {
      type: Boolean,
      default: false,
    },

    post: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    onMouseenter() {
      if (this.disablePreload) return;

      let path = this.to;
      if (this.to.hasOwnProperty('name')) {
        const route = this.$router.options.routes.filter((r) => r.name === this.to.name);
        path = route.path;
      }
      this.$store.dispatch('soppy/preloadData', { path, force: this.forcePreload });
    },

    onClick($event) {
      if (this.post) {
        let path = this.to;
        $event.preventDefault();
        this.$store.dispatch('soppy/postData', { path });
        return false;
      }
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyLink.scss" scoped></style> -->
