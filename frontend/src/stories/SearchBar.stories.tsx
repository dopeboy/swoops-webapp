import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SearchBar from '../../src/components/common/SearchBar';

export default {
    title: 'Search bar',
    component: SearchBar,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {},
} as ComponentMeta<typeof SearchBar>;

const Template: ComponentStory<typeof SearchBar> = (args) => <SearchBar {...args} />;

export const Test = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Test.args = {};
