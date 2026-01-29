import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import Footer from '@/reviactyl/ui/Footer';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

import BeforeSection from '@blueprint/components/Dashboard/Global/BeforeSection';
import AfterSection from '@blueprint/components/Dashboard/Global/AfterSection';

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <BeforeSection/>
                <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <AfterSection/>
                <ContentContainer css={tw`mt-4 mb-4`}>
                    <Footer />
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
