import SoppyBus from './utils/bus';
import { clone } from './utils/object';
import SoppyStore from './store/modules/soppy';

const soppyNameToComponentPath = (name) => {
  let parts = name.split('.');
  // Remove the first part (i.e. 'app' from 'app.home')
  parts.shift();
  // Capitalize first letter of component
  let componentName = parts.pop();
  parts.push(componentName.charAt(0).toUpperCase() + componentName.slice(1));
  // Put them back together
  return 'views/' + parts.join('/') + '.vue';
};

class Soppy {
  constructor(routesJSON = [], options) {
    // Setup options
    this.options = Object.assign(
      {
        enableSoppyLoadbarComponent: false,
      },
      options,
    );

    // Store routesJSON
    this.routesJSON = routesJSON;

    return {
      install: this.install.bind(this),
      soppyRoutes: this.soppyRoutes.bind(this),
      soppyRouter: this.soppyRouter.bind(this),
      soppyActions: this.soppyActions.bind(this),
      soppyMutations: this.soppyMutations.bind(this),
      soppyState: this.soppyState.bind(this),
      soppyModules: this.soppyModules.bind(this),
    };
  }

  install(Vue) {
    // Setup Soppy Components
    Vue.component('soppy-app', () =>
      import(/* webpackChunkName: "soppy-app" */ './components/SoppyApp.vue'),
    );
    Vue.component('soppy-link', () =>
      import(/* webpackChunkName: "soppy-link" */ './components/SoppyLink.vue'),
    );
    if (this.options.enableSoppyLoadbarComponent)
      Vue.component('soppy-loadbar', () =>
        import(/* webpackChunkName: "soppy-loadbar" */ './components/SoppyLoadbar.vue'),
      );

    return this;
  }

  /**
   * Merge the routes json created by backend with any custom frontend routes
   * @param  {Array}  routes  Any custom frontend routes
   * @return {Array}          Merged version of created backend routes with frontend routes
   */
  soppyRoutes(routes = [], nameToComponentPath = soppyNameToComponentPath) {
    let soppyRoutes = [];

    let routesByName = this.getRoutesByName(routes);

    this.routesJSON.forEach((route) => {
      let mergedRoute = Object.assign(route, routesByName[route.name]);
      soppyRoutes.push(mergedRoute);
    });

    routesByName = this.getRoutesByName(soppyRoutes);

    this.routes = soppyRoutes.map((route) => {
      // Check for path replacements
      if (routesByName[route.name] && routesByName[route.name].path && route.path) {
        const regex = /{(.*)}/;
        const str = route.path;
        const subst = routesByName[route.name].path;
        route.path = str.replace(regex, subst);
      }

      // Set the route's components
      if (
        routesByName[route.name] &&
        !(routesByName[route.name].component || routesByName[route.name].components)
      ) {
        route.components = {
          default: () => import(`@/${nameToComponentPath(route.name)}`),
        };
      }

      return route;
    });

    this.routesByName = this.getRoutesByName(this.routes);

    return this.routes;
  }

  getRoutesByName(routes) {
    return routes.reduce((obj, route) => {
      obj[route.name] = route;
      return obj;
    }, {});
  }

  /**
   * Use the router to add a 'redirect' event
   * @param  {VueRouter} router
   * @return {VueRouter}
   */
  soppyRouter(router) {
    SoppyBus.$on('redirect', (to) => {
      router.push(to);
    });

    return router;
  }

  soppyState(appState = {}) {
    let state = {
      preloadState: {},
    };

    this.routesJSON.forEach((route) => {
      if (route.path.indexOf(':') === -1) state.preloadState[route.path] = {};
    });

    return Object.assign(state, appState, window.SoppyState || {});
  }

  soppyActions(appActions = {}) {
    return {
      setSoppyState({ commit }, data) {
        commit('setSoppyState', data);
      },

      setSoppyPreloadState({ commit }, data) {
        commit('setSoppyPreloadState', data);
      },

      ...appActions,
    };
  }

  soppyMutations(appMutations = {}) {
    return {
      setSoppyState(state, { data }) {
        if (data && Object.keys(data).length) {
          Object.keys(data).forEach((key) => {
            state[key] = data[key];
          });
        }
      },

      setSoppyPreloadState(state, { path, data }) {
        if (data && Object.keys(data).length) {
          if (!state.preloadState[path]) state.preloadState[path] = {};
          Object.keys(data).forEach((key) => {
            state.preloadState[path][key] = data[key];
          });
        }
      },

      ...appMutations,
    };
  }

  soppyModules(appModules = {}) {
    return {
      soppy: SoppyStore,
      ...appModules,
    };
  }
}

export default Soppy;
