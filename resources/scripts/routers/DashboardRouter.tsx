import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { RouterContainer } from '@/reviactyl/ui/RouterContainer';
import Navbar from '@/reviactyl/ui/Navbar';
import { LogoContainer } from '@/reviactyl/ui/LogoContainer';
import { XIcon, MenuIcon } from '@heroicons/react/solid';
import tw from 'twin.macro';
import { ContentContainer } from '@/reviactyl/ui/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import Sidebar from '@/reviactyl/ui/Sidebar';
import { ApplicationStore } from '@/state';
import { useStoreState } from 'easy-peasy';
import Maintenance from '@/reviactyl/ui/Maintenance';

import { NavigationLinks, NavigationRouter } from '@blueprint/extends/routers/DashboardRouter';
import BeforeSubNavigation from '@blueprint/components/Navigation/SubNavigation/BeforeSubNavigation';
import AdditionalAccountItems from '@blueprint/components/Navigation/SubNavigation/AdditionalAccountItems';
import AfterSubNavigation from '@blueprint/components/Navigation/SubNavigation/AfterSubNavigation';

export default () => {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data!.logo);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const isUnderMaintenance = useStoreState((state) => state.reviactyl.data?.isUnderMaintenance);
    const rootAdmin = useStoreState((state) => state.user.data?.rootAdmin);
    return (
        <>
            {isUnderMaintenance && !rootAdmin ? (
                <Maintenance />
            ) : (
                <RouterContainer>
                    <Navbar>
                        <div className='lg:hidden'>
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className='text-gray-500 bg-gray-700 p-2 rounded-ui'
                            >
                                {isSidebarOpen ? <XIcon className='w-6 h-6' /> : <MenuIcon className='w-6 h-6' />}
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
                            <Sidebar isOpen={isSidebarOpen} dashboard>
                                {location.pathname.startsWith('/account') && <BeforeSubNavigation />}
                                <NavigationLinks />
                                {location.pathname.startsWith('/account') && <AdditionalAccountItems />}
                                {location.pathname.startsWith('/account') && <AfterSubNavigation />}
                            </Sidebar>
                        </CSSTransition>
                        <NavigationRouter />
                    </ContentContainer>
                </RouterContainer>
            )}
        </>
    );
};
