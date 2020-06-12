<template>
  <router-link
    :to="to"
    :tag="tag"
    :exact="exact"
    :append="append"
    :replace="replace"
    :activeClass="activeClass"
    :exactActiveClass="exactActiveClass"
    :ariaCurrentValue="ariaCurrentValue"
    :event="event"
    @mouseenter.native="onMouseenter"
    @click.native="onClick"
  >
    <slot></slot>
  </router-link>
</template>

<script>
const toTypes = [String, Object];
const eventTypes = [String, Array];
export default {
  name: 'SoppyLink',

  props: {
    // router link props
    to: {
      type: toTypes,
      required: true,
    },
    tag: {
      type: String,
      default: 'a',
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    ariaCurrentValue: {
      type: String,
      default: 'page',
    },
    event: {
      type: eventTypes,
      default: 'click',
    },
    // Custom props
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
