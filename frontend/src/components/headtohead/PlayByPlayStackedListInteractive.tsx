import { ClockIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

interface PlayByPlayStackedListProps {
    playByPlayData: any[];
}
export const PlayByPlayStackedList: React.FC<PlayByPlayStackedListProps> = ({ playByPlayData }) => {
    return (
        <div className="bg-off-black shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-white/40">
                {playByPlayData.map((data) => (
                    <li key={data.id}>
                        <div className="block hover:bg-black">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white subheading-two truncate">{data.detail}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p
                                            className={classNames(
                                                'px-3 py-0.5 flex flex-col items-center justify-center detail-one uppercase detail-one text-xs leading-5 font-semibold rounded-full',
                                                {
                                                    'bg-green-100 text-green-800': data.action_type === 'made',
                                                    'bg-red-100 text-red-800': data.action_type === 'missed',
                                                    'bg-white text-black': data.action_type !== 'missed' && data.action_type !== 'made',
                                                }
                                            )}
                                        >
                                            {data.action_type === 'made' || data.action_type === 'missed' ? data.action : ''} {data.action_type}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        {data?.player?.length > 0 && (
                                            <p className="flex items-center detail-one text-white">
                                                <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                                                <span className="mt-0.5">{data.player}</span>
                                            </p>
                                        )}
                                        {data.team && (
                                            <p
                                                className={classNames('flex items-center detail-one text-white', {
                                                    'sm:mt-0 sm:ml-6': data?.player?.length > 0,
                                                })}
                                            >
                                                <ShieldCheckIcon className=" flex-shrink-0 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                                                <span className="mt-0.5">{data.team?.name ? data.team.name : 'Unnamed'}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center mr-2 text-white sm:mt-0">
                                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                                        <p className="subheading-two">
                                            <time dateTime={data.gameclock}>{data.gameclock}</time>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
