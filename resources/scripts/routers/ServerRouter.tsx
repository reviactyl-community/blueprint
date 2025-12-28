import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Navbar from '@/reviactyl/ui//Navbar';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
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

import { NavigationLinks, NavigationRouter } from '@blueprint/extends/routers/ServerRouter';
import BeforeSubNavigation from '@blueprint/components/Navigation/SubNavigation/BeforeSubNavigation';
import AdditionalServerItems from '@blueprint/components/Navigation/SubNavigation/AdditionalServerItems';
import AfterSubNavigation from '@blueprint/components/Navigation/SubNavigation/AfterSubNavigation';

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
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.logo);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

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
                                        <BeforeSubNavigation />
                                        <NavigationLinks />
                                        <AdditionalServerItems />
                                        <AfterSubNavigation />
                                    </Sidebar>
                                </CSSTransition>
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
