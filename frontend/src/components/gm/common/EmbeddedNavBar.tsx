import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Tabs, { TabPane } from 'rc-tabs';

export interface EmbeddedNavbarRoute {
    path: string;
    title: string;
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
        <div className="pb-4">
            <Tabs
                data-extra="tabs"
                activeKey={section as string}
                defaultActiveKey={section as string}
                onTabClick={(key) => {
                    router.push(key, null, { shallow: true });
                }}
            >
                {tabs.map((tab) => (
                    <TabPane key={tab.href} tab={<div className="flex items-center">{tab.name}</div>} />
                ))}
            </Tabs>
        </div>
    );
}
