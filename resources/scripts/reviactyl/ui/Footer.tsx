import React from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import Md2React from '@/reviactyl/ui/Md2React';

import Attribution from '@/blueprint/extends/Attribution';

const Container = styled.div`
    ${tw`mt-4 mb-4`}
`;

const Copyright = styled.div`
    ${tw`text-center text-gray-500 text-xs`}
`;

export default () => {
    const customCopyright = useStoreState((state) => state.reviactyl.data!.customCopyright);
    const copyright = useStoreState((state) => state.reviactyl.data!.copyright);
    return (
        <Container>
            <Copyright>
                <a
                    rel={'noopener nofollow noreferrer'}
                    href={'https://reviactyl.dev'}
                    target={'_blank'}
                    css={tw`no-underline text-neutral-500 hover:text-neutral-300`}
                >
                    Reviactyl&trade;
                </a>
                &nbsp;&copy; {new Date().getFullYear()}
                <Attribution />
            </Copyright>
            {customCopyright ? (
                <Copyright>
                    <Md2React markdown={copyright} />
                </Copyright>
            ) : (
                ''
            )}
        </Container>
    );
};
