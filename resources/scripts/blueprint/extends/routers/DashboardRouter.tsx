import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useLocation } from 'react-router';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import Spinner from '@/components/elements/Spinner';
import { useStoreState } from 'easy-peasy';
import { useTranslation } from 'react-i18next';
import Announcement from '@/reviactyl/ui/Announcement';
import MaintenanceAlert from '@/reviactyl/ui/MaintenanceAlert';
import QuickLinks from '@/reviactyl/ui/QuickLinks';

import routes from '@/routers/routes';
import blueprintRoutes from './routes';
import { UiBadge } from '@blueprint/ui';
import { FaPuzzlePiece } from 'react-icons/fa6';

interface Props {
    route: any;
}

const NavItem = ({ route }: Props) => {
    const { t } = useTranslation('routes');
    const to = (value: string) => {
        return `/account/${value.replace(/^\/+/, '')}`;
    };

    return (
        <NavLink id={route.name} to={to(route.path)} exact={route.exact}>
            <span className='flex items-center'>
                {route.icon && <route.icon className={`w-5 mr-1`} />} {route.name ? t(route.name as string) : null}
            </span>
        </NavLink>
    );
};

export const NavigationLinks = () => {
  const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
  return (
    <>
      {/* Reviactyl routes */}
      {routes.account
      .filter((route) => !!route.name)
      .map((route) => (
      <NavItem key={route.path} route={route} />
      ))}

      {/* Blueprint routes */}
      {blueprintRoutes.account.length > 0 &&
        blueprintRoutes.account
          .filter((route) => !!route.name)
          .filter((route) => (route.adminOnly ? rootAdmin : true))
          .map(({ path, name, exact = false, adminOnly }) => (
            <NavLink key={path} to={`/account/${path}`.replace('//', '/')} exact={exact}>
              <span className='flex items-center'>
                <FaPuzzlePiece className={`w-5 mr-1`} /> {name}
              {adminOnly ? (
                <>
                  <span className={'hidden'}>(</span>
                  <UiBadge>ADMIN</UiBadge>
                  <span className={'hidden'}>)</span>
                </>
              ) : undefined}
              </span>
            </NavLink>
          ))}
    </>
  );
};

export const NavigationRouter = () => {
  const location = useLocation();
  const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
  return (
    <div className='w-full flex-1 overflow-y-auto'>
      <TransitionRouter>
        <React.Suspense fallback={<Spinner centered />}>
          <Switch location={location}>
            <Route path={'/'} exact>
              <Announcement />
              <MaintenanceAlert />
              <QuickLinks />
              <DashboardContainer />
            </Route>

            {/* Reviactyl routes */}
            {routes.account.map(({ path, component: Component }) => (
              <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                <Component />
              </Route>
            ))}

            {/* Blueprint routes */}
            {blueprintRoutes.account.length > 0 &&
              blueprintRoutes.account
                .filter((route) => (route.adminOnly ? rootAdmin : true))
                .map(({ path, component: Component }) => (
                  <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                    <Component />
                  </Route>
                ))}

            <Route path={'*'}>
              <NotFound />
            </Route>
          </Switch>
        </React.Suspense>
      </TransitionRouter>
    </div>
  );
};
