import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import Navbar from '@/reviactyl/ui//Navbar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Can from '@/components/elements/Can';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import Sidebar from '@/reviactyl/ui/Sidebar';
import { XIcon, MenuIcon } from '@heroicons/react/solid';
import { LogoContainer } from '@/reviactyl/ui/LogoContainer';
import tw from 'twin.macro';
import { RouterContainer } from '@/reviactyl/ui/RouterContainer';
import { ContentContainer } from '@/reviactyl/ui/ContentContainer';
import TopServerDetails from '@/components/server/TopServerDetails';
import { ApplicationStore } from '@/state';
import Announcement from '@/reviactyl/ui/Announcement';
import MaintenanceAlert from '@/reviactyl/ui/MaintenanceAlert';
import Maintenance from '@/reviactyl/ui/Maintenance';
import { useTranslation } from 'react-i18next';

import { NavigationLinks, NavigationRouter } from '@blueprint/extends/routers/ServerRouter';
import BeforeSubNavigation from '@blueprint/components/Navigation/SubNavigation/BeforeSubNavigation';
import AdditionalServerItems from '@blueprint/components/Navigation/SubNavigation/AdditionalServerItems';
import AfterSubNavigation from '@blueprint/components/Navigation/SubNavigation/AfterSubNavigation';

interface Props {
    route: any;
}

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

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const isUnderMaintenance = useStoreState((state) => state.reviactyl.data?.isUnderMaintenance);
    const rootAdmin = useStoreState((state) => state.user.data?.rootAdmin);
    const [error, setError] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);

    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.logo);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    const serverNestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
    const serverEggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            {isUnderMaintenance && !rootAdmin ? (
                <Maintenance />
            ) : (
                <RouterContainer>
                    {!uuid || !id ? (
                        error ? (
                            <ServerError message={error} />
                        ) : (
                            <Spinner size={'large'} centered />
                        )
                    ) : (
                        <>
                            <Navbar>
                                <div className='lg:hidden'>
                                    <button
                                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                                        className='text-gray-500 bg-gray-700 p-2 rounded-ui'
                                    >
                                        {isSidebarOpen ? (
                                            <XIcon className='w-6 h-6' />
                                        ) : (
                                            <MenuIcon className='w-6 h-6' />
                                        )}
                                    </button>
                                </div>
                                <LogoContainer>
                                    <img
                                        src={logo}
                                        alt={name}
                                        onClick={() => (window.location.href = '/')}
                                        css={tw`h-[3rem] mt-5 cursor-pointer`}
                                    />
                                </LogoContainer>
                            </Navbar>
                            <ContentContainer>
                                {isSidebarOpen && (
                                    <div
                                        onClick={() => setSidebarOpen(false)}
                                        className='fixed inset-0 z-30 bg-gray-800/40 backdrop-blur-sm transition-all duration-300 ease-in-out lg:hidden'
                                    />
                                )}
                                <CSSTransition timeout={150} classNames='fade'>
                                    <Sidebar isOpen={isSidebarOpen}>
                                        <ServerNavigation />
                                        <NavigationLinks />
                                        <AdditionalServerItems />
                                    </Sidebar>
                                </CSSTransition>
                                <BeforeSubNavigation />
                                <AfterSubNavigation />
                                <div className='w-full flex-1 overflow-y-auto'>
                                    <InstallListener />
                                    <TransferListener />
                                    <WebsocketHandler />
                                    {inConflictState &&
                                    (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                                        <ConflictStateRenderer />
                                    ) : (
                                        <ErrorBoundary>
                                            <TopServerDetails />
                                            <Announcement />
                                            <MaintenanceAlert />
                                            <TransitionRouter>
                                                <Switch location={location}>
                                                    {routes.server.control.map(
                                                        ({
                                                            path,
                                                            permission,
                                                            component: Component,
                                                            nestIds,
                                                            eggIds,
                                                            nestId,
                                                            eggId,
                                                        }) => {
                                                            return (
                                                                ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
                                                                    (eggIds && eggIds.includes(serverEggId ?? 0)) ||
                                                                    (nestId && serverNestId === nestId) ||
                                                                    (eggId && serverEggId === eggId) ||
                                                                    (!eggIds && !nestIds && !nestId && !eggId)) && (
                                                                    <PermissionRoute
                                                                        key={path}
                                                                        permission={permission}
                                                                        path={to(path)}
                                                                        exact
                                                                    >
                                                                        <Spinner.Suspense>
                                                                            <Component />
                                                                        </Spinner.Suspense>
                                                                    </PermissionRoute>
                                                                )
                                                            );
                                                        }
                                                    )}
                                                    {routes.server.management.map(
                                                        ({
                                                            path,
                                                            permission,
                                                            component: Component,
                                                            nestIds,
                                                            eggIds,
                                                            nestId,
                                                            eggId,
                                                        }) => {
                                                            return (
                                                                ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
                                                                    (eggIds && eggIds.includes(serverEggId ?? 0)) ||
                                                                    (nestId && serverNestId === nestId) ||
                                                                    (eggId && serverEggId === eggId) ||
                                                                    (!eggIds && !nestIds && !nestId && !eggId)) && (
                                                                    <PermissionRoute
                                                                        key={path}
                                                                        permission={permission}
                                                                        path={to(path)}
                                                                        exact
                                                                    >
                                                                        <Spinner.Suspense>
                                                                            <Component />
                                                                        </Spinner.Suspense>
                                                                    </PermissionRoute>
                                                                )
                                                            );
                                                        }
                                                    )}
                                                    {routes.server.administration.map(
                                                        ({
                                                            path,
                                                            permission,
                                                            component: Component,
                                                            nestIds,
                                                            eggIds,
                                                            nestId,
                                                            eggId,
                                                        }) => {
                                                            return (
                                                                ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
                                                                    (eggIds && eggIds.includes(serverEggId ?? 0)) ||
                                                                    (nestId && serverNestId === nestId) ||
                                                                    (eggId && serverEggId === eggId) ||
                                                                    (!eggIds && !nestIds && !nestId && !eggId)) && (
                                                                    <PermissionRoute
                                                                        key={path}
                                                                        permission={permission}
                                                                        path={to(path)}
                                                                        exact
                                                                    >
                                                                        <Spinner.Suspense>
                                                                            <Component />
                                                                        </Spinner.Suspense>
                                                                    </PermissionRoute>
                                                                )
                                                            );
                                                        }
                                                    )}
                                                    <Route path={'*'} component={NotFound} />
                                                </Switch>
                                            </TransitionRouter>
                                            <NavigationRouter />
                                        </ErrorBoundary>
                                    )}
                                </div>
                            </ContentContainer>
                        </>
                    )}
                </RouterContainer>
            )}
        </React.Fragment>
    );
};