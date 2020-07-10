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
    @mouseenter.native="onSoppyMouseenter"
    @click.native="onSoppyClick"
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

    cancelPreload: {
      type: Boolean,
      default: true,
    },

    cancelablePreload: {
      type: Boolean,
      default: true,
    },

    disablePreload: {
      type: Boolean,
      default: false,
    },

    usePreload: {
      type: Boolean,
      default: false,
    },

    post: {
      type: Boolean,
      default: false,
    },

    onClick: {
      type: Function,
      default: () => {},
    },

    onMouseenter: {
      type: Function,
      default: () => {},
    },
  },

  methods: {
    onSoppyMouseenter($event) {
      this.onMouseenter($event);

      if (this.disablePreload) return;
      let path = $event.target.getAttribute('href');
      this.$store.dispatch('soppy/preloadData', {
        path,
        force: this.forcePreload,
        cancelable: this.cancelablePreload,
        cancel: this.cancelPreload,
        use: this.usePreload,
      });
    },

    onSoppyClick($event) {
      this.onClick($event);

      if (this.post) {
        let path = $event.target.getAttribute('href');
        $event.preventDefault();
        this.$store.dispatch('soppy/postData', { path });
        return false;
      }
    },
  },
};
</script>

<!-- <style lang="scss" src="./SoppyLink.scss" scoped></style> -->
