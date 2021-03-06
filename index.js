import SoppyBus from './utils/bus';
import { clone, mergeDeep } from './utils/helpers';
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
  soppyRoutes(routes = [], overrides = {}, nameToComponentPath = soppyNameToComponentPath) {
    let manualRoutesByName = this.getRoutesByName(routes);

    let soppyRoutes = this.routesJSON.reduce((arr, routeFromJSON) => {
      let manualRoute = manualRoutesByName[routeFromJSON.name];
      let route = routeFromJSON;
      if (manualRoute) {
        Object.keys(manualRoute).forEach((key) => {
          let val = manualRoute[key];
          route[key] = val;
        });
        delete manualRoutesByName[routeFromJSON.name];
      }
      arr.push(route);
      return arr;
    }, []);

    Object.keys(manualRoutesByName).forEach((name) => {
      let route = manualRoutesByName[name];
      soppyRoutes.unshift(route);
    });

    let routesByName = this.getRoutesByName(soppyRoutes);

    // Build routes
    this.routes = soppyRoutes.map((route) => {
      let hasMatch = route.path.match(/{(.*)}/);
      if (hasMatch && hasMatch.length) {
        let [str, name] = hasMatch;
        route.path = route.path.replace(str, routesByName[name].path);
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

      // set overrides
      route = mergeDeep(route, overrides);

      return route;
    });

    // Reset and store final version of routesByName
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

    return Object.assign(state, appState, window.SoppyState);
  }

  soppyActions(
    appActions = {},
    setSoppyStateCallback = () => {},
    setSoppyPreloadStateCallback = () => {},
  ) {
    return {
      setSoppyState(store, payload) {
        store.commit('setSoppyState', payload);
        setSoppyStateCallback(store, payload);
      },

      setSoppyPreloadState(store, payload) {
        store.commit('setSoppyPreloadState', payload);
        setSoppyPreloadStateCallback(store, payload);
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
