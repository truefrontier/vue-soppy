import store from '@/store';
import SoppyBus from './bus';

export const soppyRoutes = (routesJSON, args = []) => {
  let beforeEnters = {};
  let paths = {};
  let components = {};
  let children = {};
  let extendRoutes = [];
  if (Array.isArray(args)) {
    extendRoutes = args;
  } else {
    beforeEnters = args.beforeEnters || {};
    paths = args.paths || {};
    components = args.components || {};
    children = args.children || {};
  }
  extendRoutes.forEach((route) => {
    if (route.hasOwnProperty('beforeEnter')) beforeEnters[route.name] = route.beforeEnter;
    if (route.hasOwnProperty('component')) components[route.name] = route.component;
    else if (route.hasOwnProperty('components')) components[route.name] = route.components;
    if (route.hasOwnProperty('path')) paths[route.name] = route.path;
    if (route.hasOwnProperty('children')) chilren[route.name] = route.children;
  });

  return routesJSON.map((route) => {
    if (beforeEnters.hasOwnProperty(route.name)) route.beforeEnter = beforeEnters[route.name];
    if (paths.hasOwnProperty(route.name)) {
      route.path = paths[route.name];
    }

    route.components = {};
    if (components.hasOwnProperty(route.name)) {
      // Manually set component
      route.components.default = components[route.name];
    } else {
      // Dynamically set component
      let parts = route.name.split('.');
      // Remove the first part (i.e. 'app' from 'app.home')
      parts.shift();
      // Capitalize first letter of component
      let component = parts.pop();
      parts.push(component.charAt(0).toUpperCase() + component.slice(1));
      route.components.default = () => import(`@/views/${parts.join('/')}.vue`);
    }

    if (children.hasOwnProperty(route.name)) {
      route.children = children[route.name];
    }
    return route;
  });
};

export const soppyRouter = (router) => {
  SoppyBus.$on('redirect', (to) => {
    router.push(to);
  });

  return router;
};
