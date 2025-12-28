import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import Card from '@/reviactyl/ui/Card';
import Title from '@/reviactyl/ui/Title';
import { EmojiSadIcon } from '@heroicons/react/solid';
import { useTranslation } from 'react-i18next';

import BeforeContent from '@blueprint/components/Dashboard/Serverlist/BeforeContent';
import AfterContent from '@blueprint/components/Dashboard/Serverlist/AfterContent';

export default () => {
    const { t } = useTranslation('dashboard/index');
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock className='pr-2' title={t('title')} showFlashKey={'dashboard'}>
            <BeforeContent />
            <div className='grid lg:grid-cols-2 gap-2 py-4'>
                <div>
                    <Title className='text-4xl'>{t('title')}</Title>
                </div>
                {rootAdmin && (
                    <div className='flex lg:justify-end justify-center'>
                        <div className='mb-2 pt-4'>
                            <div className='flex lg:justify-end sm:justify-center items-center space-x-2'>
                                <p className='uppercase text-xs text-gray-400'>
                                    {showOnlyAdmin ? t('other-servers') : t('your-servers')}
                                </p>
                                <Switch
                                    name={'show_all_servers'}
                                    defaultChecked={showOnlyAdmin}
                                    onChange={() => setShowOnlyAdmin((s) => !s)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <div className='grid lg:grid-cols-2 gap-3'>
                    <Pagination data={servers} onPageSelect={setPage}>
                        {({ items }) =>
                            items.length > 0 ? (
                                items.map((server, index) => (
                                    <ServerRow
                                        key={server.uuid}
                                        server={server}
                                        css={index > 0 ? tw`mt-2` : undefined}
                                    />
                                ))
                            ) : (
                                <Card css={tw`col-span-1 lg:col-span-2`}>
                                    <p className='flex justify-center text-center text-sm text-gray-400'>
                                        <EmojiSadIcon className='w-5 h-5 mr-1' />{' '}
                                        {showOnlyAdmin ? t('no-other-servers') : t('no-servers')}
                                    </p>
                                </Card>
                            )
                        }
                    </Pagination>
                </div>
            )}
            <AfterContent />
        </PageContentBlock>
    );
};
