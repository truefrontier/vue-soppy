# vue-soppy

[![npm version](https://badge.fury.io/js/vue-soppy.svg)](https://badge.fury.io/js/vue-soppy)

## What and Why?
Check out [this article on Medium](https://medium.com/@kevinkirchner/a-ready-to-try-concept-in-response-to-second-guessing-the-modern-web-6946ec4d0598) to get a better understanding why vue-soppy exists.

## How to setup

__NOTE:__ This setup assumes you're using a [vue-cli](https://cli.vuejs.org/) project with [vue-router](https://router.vuejs.org/) and [vuex](https://vuex.vuejs.org/).

```bash
$ vue create my-project && cd my-project/
$ npm install vue-soppy
```


---

__src/router/routes.json__ - Ideally, this file is auto-generated by some external script or command (check out [laravel-soppy](https://github.com/truefrontier/laravel-soppy) for the Laravel setup for vue-soppy)
```json
[
  {
    "name": "app.welcome",
    "path": "/",
  }
]
```

---

__NOTE:__ It's recommended to set up a file dedicated to the soppy instance. We put it in `src/vendor/soppy.js` but feel free to put it where you like. Just remember to change the references accordingly in the code snippets below.

__src/vendor/soppy.js__
```js
import Soppy from 'vue-soppy';
import routes from '@/router/routes.json';

const soppy = new Soppy(routes, {
  enableSoppyLoadbarComponent: true,
});

export default soppy;
export const soppyRoutes = soppy.soppyRoutes;
export const soppyRouter = soppy.soppyRouter;
export const soppyActions = soppy.soppyActions;
export const soppyMutations = soppy.soppyMutations;
export const soppyState = soppy.soppyState;
export const soppyModules = soppy.soppyModules;

```

__src/main.js__
```js
import Soppy from '@/vendor/soppy';
Vue.use(Soppy);
```

__NOTE:__ We're importing from our dedicated vendor soppy instance and _not_ the `vue-soppy` package. This is the same in the setup files below.

---

__public/index.html__ (optional)
```html
<script>
  window.SoppyState = <% if (NODE_ENV === 'production') { %>@json(array_merge($data, []))<% } else { %>{}<% } %>;
</script>
```

You can replace `@json(array_merge($data, []))` with whatever your framework can inject data with if you're not using [laravel-soppy](https://github.com/truefrontier/laravel-soppy)

---

__src/store/index.js__
```js
import Vue from 'vue';
import Vuex from 'vuex';
import { soppyState, soppyMutations, soppyActions, soppyModules } from '@/vendor/soppy';


Vue.use(Vuex);

export default new Vuex.Store({
  state: soppyState({
    // Your custom root state
  }),

  getters: {
    // Your custom root getters
  },

  actions: soppyActions({
    // Your custom root actions
  }),

  mutations: soppyMutations({
    // Your custom root mutations
  }),

  modules: soppyModules({
    // Your custom modules
  }),
});
```

---

__src/router/index.js__
```js
import Vue from 'vue';
import VueRouter from 'vue-router';
import { soppyRoutes, soppyRouter } from '@/vendor/soppy';

Vue.use(VueRouter);

const routes = soppyRoutes([
  {
    name: 'app.custom.modal',
    path: '{app.custom}/modal',
    meta: {
      get soppyPath() {
        return window.location.pathname.replace('/modal', '');
      },
    },
    components: {
      default: () => import('@/views/Promo.vue'),
      modal: () => import(/* webpackChunkName: "custom-modal-view" */ '@/views/custom/Modal'),
    },
  },
  {
    name: 'app.notFound',
    path: '*',
    components: {
      default: () => import(/* webpackChunkName: "not-found-view" */ '@/views/NotFound'),
    },
  },
]);

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes,
});

export default soppyRouter(router);

```

__NOTES:__
- Pass in any vue-specifc routes or route overrides to the `soppyRoutes` method. These will be merged with the routes from your `routes.json` that you passed in to the `Soppy` class in `@/vendor/soppy.js`.
- Each route's `components` property is generated dynamically from the route's name from the `routes.json`. By default, for example, the component property for `app.welcome` will be `{ default: () => import('@/views/Welcome.vue') }`; or for nested routes like `app.user.settings`, `{ default: () => import('@/views/user/Settings.vue') }`. To change the naming convention used here, override the `component` or `components` property as explained above OR pass in your own naming function as the second argument to `soppyRoutes`. __NOTE:__ All component paths will be prepended with `'@/'` after your naming function to bypass some dynamic import limitations.
- The first route we're passing in the above example, `app.custom.modal` is how you might implement a child route of sorts.
  - The `path` includes curly brackets around another route's name: `{app.custom}`. This will be replaced by the actually path from `app.custom`  found in `routes.json`
  - `get soppyPath()` in a route's meta will override the path that will be called to fetch data. In the example case above, we want the same data that fetched in the parent route.
  - The `SoppyApp` component has two router views: 1 is `default` and the other is named: `modal`. This way you can show multiple views (e.g. a parent and a child) at the same route.

---

Your app needs to be wrapped in the `<soppy-app>` component like this:

__src/App.vue__
```html
<template>
  <soppy-app
    id="app"
    :view-not-found="notFound"
    :view-server-error="serverError"
    :view-attrs="{ class: 'mt-7 leading-6' }"
  >
    <!-- optionally include the soppy-loadbar component -->
    <soppy-loadbar></soppy-loadbar>

    Header / Anything before router-view
    
    <template v-slot:after>
      Footer / Anything after router-view
    </template>
  </soppy-app>
</template>

<script>
export default {
  name: 'App',

  data() {
    return {
      notFound: () => import(/* webpackChunkName: "not-found-view" */ '@/views/NotFound'),
      serverError: () =>
        import(/* webpackChunkName: "server-error-view" */ '@/views/ServerError'),
    }
  }
}
</script>
```

__NOTES:__
- If you want to show a specific view when a soppy request returns a 401, 404, or 500, you can add the `:view-unauthorized`, `:view-not-found`, `:view-server-error` attributes respectively. 
- `:view-attrs` will be bound to the default component slot which is `<router-view>` by default
- View [the SoppyApp component](https://github.com/truefrontier/vue-soppy/blob/master/components/SoppyApp.vue) for more details 
- Use `<soppy-link>` to take advantage of extra functionality like preloading data on link hover. Use it like `<router-link>` and check out [the component file](https://github.com/truefrontier/vue-soppy/blob/master/components/SoppyLink.vue) for more details.
- `<soppy-loadbar>` is a tailwindcss-styled component showing the load progress of the soppy page requests. Check out [the component file](https://github.com/truefrontier/vue-soppy/blob/master/components/SoppyLoadbar.vue) for more details.