import React, { useState, useEffect } from 'react';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import TransitionRouter from '@/TransitionRouter';
import PermissionRoute from '@/components/elements/PermissionRoute';
import Can from '@/components/elements/Can';
import Spinner from '@/components/elements/Spinner';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useLocation } from 'react-router';
import { useStoreState } from 'easy-peasy';
import { ServerContext } from '@/state/server';
import { useTranslation } from 'react-i18next';

import routes from '@/routers/routes';
import blueprintRoutes from './routes';
import { UiBadge } from '@blueprint/ui';
import { FaPuzzlePiece } from 'react-icons/fa6';

interface Props {
    route: any;
}

const blueprintExtensions = [...new Set(blueprintRoutes.server.map((route) => route.identifier))];

/**
 * Get the route egg IDs for each extension with server routes.
 */
const useExtensionEggs = () => {
  const [extensionEggs, setExtensionEggs] = useState<{ [x: string]: string[] }>(
    blueprintExtensions.reduce((prev, current) => ({ ...prev, [current]: ['-1'] }), {})
  );

  useEffect(() => {
    (async () => {
      const newEggs: { [x: string]: string[] } = {};
      for (const id of blueprintExtensions) {
        const resp = await fetch(`/api/client/extensions/blueprint/eggs?${new URLSearchParams({ id })}`);
        newEggs[id] = (await resp.json()) as string[];
      }
      setExtensionEggs(newEggs);
    })();
  }, []);

  return extensionEggs;
};

const NavItem = ({ route }: Props) => {
    const { t } = useTranslation('routes');
    const match = useRouteMatch<{ id: string }>();

    const nestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
    const eggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

    const to = (value: string, url = false) => {
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    return (
        ((route.nestIds && route.nestIds.includes(nestId ?? 0)) ||
            (route.eggIds && route.eggIds.includes(eggId ?? 0)) ||
            (route.nestId && route.nestId === nestId) ||
            (route.eggId && route.eggId === eggId) ||
            (!route.eggIds && !route.nestIds && !route.nestId && !route.eggId)) && (
            <NavLink id={route.name} to={to(route.path, true)} exact={route.exact}>
                <span className='flex items-center'>
                    {route.icon && <route.icon className={`w-5 mr-1`} />} {route.name ? t(route.name as string) : null}
                </span>
            </NavLink>
        )
    );
};

const ServerNavigation = () => {
    const { t } = useTranslation('server/index');
    return (
        <>
            {[
                { label: t('control'), routes: routes.server.control },
                { label: t('management'), routes: routes.server.management },
                { label: t('administration'), routes: routes.server.administration },
            ].map(({ label, routes }) => (
                <div key={label}>
                    <span className='label'>{label}</span>
                    {routes
                        .filter((route) => !!route.name)
                        .map((route) =>
                            route.permission ? (
                                <Can key={route.path} action={route.permission} matchAny>
                                    <NavItem route={route} />
                                </Can>
                            ) : (
                                <React.Fragment key={route.path}>
                                    <NavItem route={route} />
                                </React.Fragment>
                            )
                        )}
                </div>
            ))}
        </>
    );
};

export const NavigationLinks = () => {
  const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
  const serverEgg = ServerContext.useStoreState((state) => state.server.data?.BlueprintFramework.eggId);
  const match = useRouteMatch<{ id: string }>();
  const to = (value: string, url = false) => {
    if (value === '/') {
      return url ? match.url : match.path;
    }
    return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
  };
  const extensionEggs = useExtensionEggs();

  return (
    <>
      {/* Reviactyl routes */}
      <ServerNavigation />

      {/* Blueprint routes */}
      <div key='blueprint'>
      <span className='label'>More</span>
      {blueprintRoutes.server.length > 0 &&
        blueprintRoutes.server
          .filter((route) => !!route.name)
          .filter((route) => (route.adminOnly ? rootAdmin : true))
          .filter((route) =>
            extensionEggs[route.identifier].includes('-1')
              ? true
              : extensionEggs[route.identifier].find((id) => id === serverEgg?.toString())
          )
          .map((route) =>
            route.permission ? (
              <Can key={route.path} action={route.permission} matchAny>
                <NavLink to={to(route.path, true)} exact={route.exact}>
                  <span className='flex items-center'>
                  <FaPuzzlePiece className={`w-5 mr-1`} /> {route.name}
                  {route.adminOnly ? (
                    <>
                      <span className={'hidden'}>(</span>
                      <UiBadge>ADMIN</UiBadge>
                      <span className={'hidden'}>)</span>
                    </>
                  ) : undefined}
                  </span>
                </NavLink>
              </Can>
            ) : (
              <NavLink key={route.path} to={to(route.path, true)} exact={route.exact}>
                  <span className='flex items-center'>
                  <FaPuzzlePiece className={`w-5 mr-1`} /> {route.name}
                  {route.adminOnly ? (
                    <>
                      <span className={'hidden'}>(</span>
                      <UiBadge>ADMIN</UiBadge>
                      <span className={'hidden'}>)</span>
                    </>
                  ) : undefined}
                  </span>
              </NavLink>
            )
          )}
      </div>
    </>
  );
};

export const NavigationRouter = () => {
  const serverNestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
  const serverEggId = ServerContext.useStoreState((state) => state.server.data?.eggId);
  const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
  const serverEgg = ServerContext.useStoreState((state) => state.server.data?.BlueprintFramework.eggId);
  const match = useRouteMatch<{ id: string }>();
  const to = (value: string, url = false) => {
    if (value === '/') {
      return url ? match.url : match.path;
    }
    return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
  };
  const extensionEggs = useExtensionEggs();

  const location = useLocation();
  return (
    <>
      <TransitionRouter>
        <Switch location={location}>
          {/* Reviactyl routes */}
          {routes.server.control.map(({ path, permission, component: Component, nestIds, eggIds, nestId, eggId }) => (
            ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
            (eggIds && eggIds.includes(serverEggId ?? 0)) ||
            (nestId && serverNestId === nestId) ||
            (eggId && serverEggId === eggId) ||
            (!eggIds && !nestIds && !nestId && !eggId)) && (
            <PermissionRoute key={path} permission={permission} path={to(path)} exact>
              <Spinner.Suspense>
                <Component />
              </Spinner.Suspense>
            </PermissionRoute>
            )
          ))}
          {routes.server.management.map(({ path, permission, component: Component, nestIds, eggIds, nestId, eggId }) => (
            ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
            (eggIds && eggIds.includes(serverEggId ?? 0)) ||
            (nestId && serverNestId === nestId) ||
            (eggId && serverEggId === eggId) ||
            (!eggIds && !nestIds && !nestId && !eggId)) && (
            <PermissionRoute key={path} permission={permission} path={to(path)} exact>
              <Spinner.Suspense>
                <Component />
              </Spinner.Suspense>
            </PermissionRoute>
            )
          ))}
          {routes.server.administration.map(({ path, permission, component: Component, nestIds, eggIds, nestId, eggId }) => (
            ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
            (eggIds && eggIds.includes(serverEggId ?? 0)) ||
            (nestId && serverNestId === nestId) ||
            (eggId && serverEggId === eggId) ||
            (!eggIds && !nestIds && !nestId && !eggId)) && (
            <PermissionRoute key={path} permission={permission} path={to(path)} exact>
              <Spinner.Suspense>
                <Component />
              </Spinner.Suspense>
            </PermissionRoute>
            )
          ))}

          {/* Blueprint routes */}
          {blueprintRoutes.server.length > 0 &&
            blueprintRoutes.server
              .filter((route) => (route.adminOnly ? rootAdmin : true))
              .filter((route) =>
                extensionEggs[route.identifier].includes('-1')
                  ? true
                  : extensionEggs[route.identifier].find((id) => id === serverEgg?.toString())
              )
              .map(({ path, permission, component: Component }) => (
                <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                  <Spinner.Suspense>
                    <Component />
                  </Spinner.Suspense>
                </PermissionRoute>
              ))}

          <Route path={'*'} component={NotFound} />
        </Switch>
      </TransitionRouter>
    </>
  );
};
