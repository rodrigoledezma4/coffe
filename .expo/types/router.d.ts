/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/admin`; params?: Router.UnknownInputParams; } | { pathname: `/checkout`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/ordersReport`; params?: Router.UnknownInputParams; } | { pathname: `/salesReport`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/admin`; params?: Router.UnknownOutputParams; } | { pathname: `/checkout`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/ordersReport`; params?: Router.UnknownOutputParams; } | { pathname: `/salesReport`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/admin${`?${string}` | `#${string}` | ''}` | `/checkout${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/ordersReport${`?${string}` | `#${string}` | ''}` | `/salesReport${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/admin`; params?: Router.UnknownInputParams; } | { pathname: `/checkout`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/ordersReport`; params?: Router.UnknownInputParams; } | { pathname: `/salesReport`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
