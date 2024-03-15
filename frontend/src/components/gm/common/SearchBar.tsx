import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const SearchBar = (props): JSX.Element => {
    return (
        <div className="relative flex flex-wrap w-full lg:w-auto items-stretch grow">
            <span className="pl-5 bg-white/4 rounded-l-lg flex items-center py-1.5 leading-6 text-base font-normal text-center whitespace-nowrap focus:border-none">
                <MagnifyingGlassIcon className="text-white h-6 w-6" />
            </span>
            <input
                className="pl-3 h-12 bg-white/4 placeholder:capitalize rounded-r-lg rounded-l-none text-white text-base font-display grow appearance-none  focus:outline focus:ring-indigo-500 focus:border-indigo-500  placeholder:text-white/32 focus:text-white"
                placeholder="Search Games"
                {...props}
            />
        </div>
    );
};

export default SearchBar;
