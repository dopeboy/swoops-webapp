import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Tabs, { TabPane } from 'rc-tabs';
import { trackEvent } from '../../lib/tracking';

export interface EmbeddedNavbarRoute {
    path: string;
    title: string;
    section?: string;
}

export interface EmbeddedNavBarProps {
    routesToUse: EmbeddedNavbarRoute[];
}

export default function EmbeddedNavBar(props: EmbeddedNavBarProps): ReactElement {
    const router = useRouter();
    const { section } = router.query;
    const { routesToUse } = props;
    const tabs = routesToUse.map(({ path, title }) => ({
        name: title,
        href: path,
    }));

    return (
        <div className="pb-4 flex flex-row items-center">
            <Tabs
                data-extra="tabs"
                className="flex flex-row items-center"
                activeKey={section as string}
                defaultActiveKey={section as string}
                onTabClick={(key) => {
                    trackEvent(`Tab ${key} clicked`);
                    router.push(key, null, { shallow: true });
                }}
            >
                {tabs.map((tab) => (
                    <TabPane
                        key={tab.href}
                        className="flex flex-row items-center"
                        tab={<div className="flex flex-row items-center subheading-one">{tab.name}</div>}
                    />
                ))}
            </Tabs>
        </div>
    );
}
