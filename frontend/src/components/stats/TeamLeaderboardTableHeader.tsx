import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { SortDirection } from 'src/models/sort-direction.enum';
import { SortableHeader } from 'src/models/sortable-header';
import { SPIcon } from '../common/SPIcon';
import { Tooltip } from 'react-tooltip';

interface TeamLeaderboardTableHeaderProps {
    headers: Array<SortableHeader>;
    updateSortDirection?: (columnToSort: SortableHeader) => void;
}

export const TeamLeaderboardTableHeader: React.FC<TeamLeaderboardTableHeaderProps> = ({ headers, updateSortDirection }) => {
    return (
        <tr>
            {headers.map((header, index) => (
                <th key={header.title + header.value + index} scope="col" className="text-white py-4 px-3 whitespace-nowrap first:pl-12">
                    <div
                        onClick={() => {
                            if (updateSortDirection) updateSortDirection(header);
                        }}
                        className="flex flex-row items-center gap-1 hover:cursor-pointer w-full justify-center"
                    >
                        {header.value !== 'total_sp' && <span className="subheading-two">{header.title}</span>}
                        {header.value === 'total_sp' && (
                            <span className="flex flex-row items-center gap-1 justify-start">
                                <button type="button" data-tooltip-id="sp-tooltip">
                                    <InformationCircleIcon className="h-5 w-5 text-white" />
                                </button>
                                <SPIcon size="sm" color="white" />
                                <Tooltip
                                    id="sp-tooltip"
                                    place="bottom"
                                    clickable
                                    style={{ zIndex: 999, opacity: '100%', backgroundColor: '#4E4E4E', borderRadius: '10px' }}
                                >
                                    <div className="z-50 flex flex-col items-start justify-center w-fit flex-wrap py-1.5 gap-4">
                                        <div className="flex flex-row gap-2 items-center justify-center">
                                            <svg width="82" height="24" viewBox="0 0 82 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M48.3821 11.5003C48.7634 11.4953 49.1097 11.4802 49.4559 11.4802C56.0898 11.4802 62.7236 11.4802 69.3625 11.4752C69.8843 11.4752 70.4213 11.4451 70.9231 11.3146C71.9468 11.0487 72.564 10.3361 72.7747 9.30242C72.9955 8.20347 72.4134 7.32029 71.3095 7.0995C70.913 7.01921 70.4965 7.00416 70.0901 7.00416C66.1459 6.99914 62.1967 7.00416 58.2525 6.99914C57.9314 6.99914 57.6153 6.98409 57.279 6.97907C55.603 4.73601 53.9421 2.508 52.2911 0.285011C52.266 0.249884 52.2911 0.179632 52.2911 0.0893074C52.5621 -0.0411615 52.8582 0.0140369 53.1392 0.0140369C55.4174 0.0140369 57.7006 0.0140369 59.9787 0.0140369C63.4562 0.0140369 66.9337 0.0140369 70.4112 0.0140369C72.1124 0.0140369 73.7984 0.139488 75.4393 0.636273C76.9146 1.08288 78.2544 1.76533 79.3433 2.88435C80.4925 4.06359 81.1197 5.48871 81.2402 7.11455C81.5011 10.6723 80.1362 13.4925 77.2659 15.59C75.6802 16.7492 73.8787 17.4116 71.9819 17.8331C70.4062 18.1843 68.8004 18.2847 67.1947 18.2897C63.6269 18.2998 60.0641 18.2897 56.4962 18.2897C56.1801 18.2897 55.8589 18.3048 55.5177 18.3098C55.4324 18.5657 55.3521 18.7815 55.2819 18.9973C54.4188 21.6367 52.6323 23.2676 49.9276 23.8848C49.6717 23.945 49.4058 23.9751 49.1448 23.9802C48.2968 24.0002 47.4487 24.0002 46.6007 24.0002C46.4903 24.0002 46.3749 23.9651 46.2695 23.945C46.2645 23.2375 47.9305 13.4373 48.3871 11.4853L48.3821 11.5003Z"
                                                    fill="#FDFDFD"
                                                />
                                                <path
                                                    d="M0.510036 23.9583C1.71938 22.749 2.65775 21.5848 3.79183 20.6163C6.49655 18.298 9.64286 17.1388 13.2057 17.1288C19.3477 17.1137 25.4848 17.1288 31.6269 17.1238C31.9179 17.1238 32.214 17.1488 32.505 17.1087C32.8161 17.0635 33.1423 16.9933 33.4283 16.8628C33.8549 16.6671 34.0857 16.2958 34.1309 15.8241C34.176 15.2821 33.9502 14.9158 33.4384 14.7452C33.2477 14.68 33.0369 14.6549 32.8362 14.6449C32.5452 14.6248 32.2541 14.6348 31.958 14.6348C27.6325 14.6348 23.3019 14.6348 18.9764 14.6348C17.7119 14.6348 16.4674 14.4993 15.253 14.138C14.5455 13.9323 13.8831 13.6312 13.2759 13.2147C12.1318 12.4319 11.4092 11.348 11.1884 9.99313C10.9174 8.31711 11.078 6.6712 11.7504 5.09052C12.2823 3.84604 13.1153 2.85247 14.2293 2.08973C15.4588 1.25172 16.8237 0.769989 18.2638 0.458871C20.0151 0.0775007 21.7965 0.00724827 23.5779 0.00223024C30.0663 -0.0027878 36.5596 0.00223024 43.0479 0.00223024C44.5383 0.00223024 46.0286 0.00223024 47.519 0.00223024C47.7398 0.00223024 47.9606 0.0423745 48.2767 0.0724827C48.1061 0.288258 48.0107 0.428763 47.8953 0.549196C46.7512 1.75854 45.6121 2.97792 44.453 4.17723C42.6314 6.05398 40.4084 6.99235 37.784 6.98733C32.3444 6.98231 26.9099 6.98733 21.4704 6.98733C21.0037 6.98733 20.532 7.02246 20.0753 7.10777C19.4381 7.2282 19.1069 7.64971 19.0868 8.26693C19.0667 8.76372 19.3026 9.12 19.7994 9.22538C20.1958 9.31068 20.6073 9.33577 21.0137 9.34079C25.254 9.35083 29.4942 9.34079 33.7294 9.34581C34.8384 9.34581 35.9524 9.35584 37.0514 9.56158C37.9195 9.72718 38.7575 9.95801 39.5453 10.3695C41.2163 11.2376 42.1296 12.5975 42.2099 14.4943C42.2651 15.6986 42.1647 16.8879 41.8285 18.0521C41.2514 20.0643 40.0421 21.5697 38.1854 22.5583C36.956 23.2106 35.6363 23.5569 34.2714 23.7777C33.2025 23.9533 32.1186 23.9985 31.0398 23.9985C21.1894 23.9985 11.3339 23.9985 1.48353 23.9985C1.22761 23.9985 0.976713 23.9734 0.5 23.9483L0.510036 23.9583Z"
                                                    fill="#FDFDFD"
                                                />
                                            </svg>
                                            <h2 className="subheading-one text-white">Swooper Points</h2>
                                        </div>
                                        <p className="text-xs font-normal whitespace-pre-wrap w-64 text-start text-white">
                                            Swooper Points are team points that reward activity and performance. Swooper Bowl qualification and
                                            seeding will be determined by SP ranking.
                                        </p>
                                        <a
                                            href="https://blog.playswoops.com/swooper-points-overview/"
                                            target="_blank"
                                            className="w-full text-xs underline text-end"
                                        >
                                            More info
                                        </a>
                                    </div>
                                </Tooltip>
                            </span>
                        )}
                        {header.sortDirection === SortDirection.DESC && header.value !== 'rank' && (
                            <ArrowDownIcon className="h-3 w-3 text-white border-white" strokeWidth={3} />
                        )}
                        {header.sortDirection === SortDirection.ASC && header.value !== 'rank' && (
                            <ArrowUpIcon className="h-3 w-3 text-white" strokeWidth={3} />
                        )}
                        {header.sortDirection === SortDirection.NONE && header.value !== 'rank' && (
                            <ArrowsUpDownIcon className="h-3 w-3 text-white" strokeWidth={3} />
                        )}
                    </div>
                </th>
            ))}
        </tr>
    );
};
