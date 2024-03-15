import { ClockIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

interface PlayByPlayStackedListProps {
    playByPlayData: any[];
}
export const PlayByPlayStackedList: React.FC<PlayByPlayStackedListProps> = ({ playByPlayData }) => {
    const imageBaseUrl = process.env.NEXT_PUBLIC_SWOOPS_IMAGE_BASEURL;

    return (
        <div className="bg-off-black shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-white/40">
                {playByPlayData.map((data, index) => (
                    <li key={data.id + '_' + index}>
                        <div className="hover:bg-black flex flex-row items-center justify-between w-full">
                            <div className="w-1/2">
                                {data.team?.lineupNumber === 1 && (
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-end">
                                            <p className="font-medium text-white text-lg truncate">{data.detail}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p
                                                    className={classNames(
                                                        'px-3 flex flex-col items-center justify-center uppercase detail-one text-xs leading-5 font-semibold rounded-full',
                                                        {
                                                            'bg-green-100 text-green-800': data.action_type === 'made',
                                                            'bg-red-100 text-red-800': data.action_type === 'missed',
                                                            'bg-white text-black': data.action_type !== 'missed' && data.action_type !== 'made',
                                                        }
                                                    )}
                                                >
                                                    {data.action_type === 'made' || data.action_type === 'missed' ? data.action : ''}{' '}
                                                    {data.action_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-end">
                                            <div className="sm:flex gap-3">
                                                {data.team && (
                                                    <p
                                                        className={classNames('flex items-center text-base text-white', {
                                                            'sm:mt-0 sm:ml-6': data?.player?.length > 0,
                                                        })}
                                                    >
                                                        <ShieldCheckIcon className=" flex-shrink-0 mr-1 h-5 w-5 text-white" aria-hidden="true" />
                                                        <span className="mt-0.5 font-semibold">{data.team?.name ? data.team.name : 'Unnamed'}</span>
                                                    </p>
                                                )}
                                                {data?.player?.length > 0 && (
                                                    <p className="flex items-center text-base text-white font-semibold">
                                                        {!data.token ? (
                                                            <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                                                        ) : (
                                                            <img
                                                                className="flex-shrink-0 mr-1.5 h-5 w-5 rounded-full bg-white bg-opacity-80"
                                                                src={`${imageBaseUrl}${2}_no_bg.png?width=${20}&height=${20}&auto=format`}
                                                                alt="Player image"
                                                            />
                                                        )}
                                                        <span className="mt-0.5">{data.player}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="mt-2 flex items-center mr-2 text-white sm:mt-0">
                                    <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                                    <p className="text-lg">
                                        <time dateTime={data.gameclock}>{data.gameclock}</time>
                                    </p>
                                </div>
                                <div className="flex flex-row items-center justify-center gap-1 text-white font-semibold">
                                    <span className="text-lg text-white whitespace-nowrap">{data.challenger_score}</span>-
                                    <span className="text-lg text-white whitespace-nowrap">{data.challenged_score}</span>
                                </div>
                            </div>
                            <div className="w-1/2">
                                {data.team?.lineupNumber === 2 && (
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-start">
                                            <div className="mr-2 flex-shrink-0 flex">
                                                <p
                                                    className={classNames(
                                                        'px-3 flex flex-col items-center justify-center uppercase detail-one text-xs leading-5 font-semibold rounded-full',
                                                        {
                                                            'bg-green-100 text-green-800': data.action_type === 'made',
                                                            'bg-red-100 text-red-800': data.action_type === 'missed',
                                                            'bg-white text-black': data.action_type !== 'missed' && data.action_type !== 'made',
                                                        }
                                                    )}
                                                >
                                                    {data.action_type === 'made' || data.action_type === 'missed' ? data.action : ''}{' '}
                                                    {data.action_type}
                                                </p>
                                            </div>
                                            <p className="font-medium text-white text-lg truncate">{data.detail}</p>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-start">
                                            <div className="sm:flex sm:justify-start gap-3">
                                                {data?.player?.length > 0 && (
                                                    <p className="flex items-center text-base text-white font-semibold">
                                                        {!data.token ? (
                                                            <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-white" aria-hidden="true" />
                                                        ) : (
                                                            <img
                                                                className="flex-shrink-0 mr-1.5 h-5 w-5 rounded-full bg-white bg-opacity-80"
                                                                src={`${imageBaseUrl}${2}_no_bg.png?width=${20}&height=${20}&auto=format`}
                                                                alt="Player image"
                                                            />
                                                        )}
                                                        <span className="mt-0.5">{data.player}</span>
                                                    </p>
                                                )}
                                                {data.team && (
                                                    <p
                                                        className={classNames('flex items-center text-base text-white', {
                                                            'sm:mt-0': data?.player?.length > 0,
                                                        })}
                                                    >
                                                        <ShieldCheckIcon className="flex-shrink-0 mr-1 h-5 w-5 text-white" aria-hidden="true" />
                                                        <span className="mt-0.5 font-semibold">{data.team?.name ? data.team.name : 'Unnamed'}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
