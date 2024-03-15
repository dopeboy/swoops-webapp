import classNames from 'classnames';
import { SPIcon } from './SPIcon';

interface SPPrizeProps {
    challengeType: 'DAILY' | 'WEEKLY' | 'BI-SEASONAL' | 'SEASONAL' | 'TRAINING' | 'ROTATING';
    spReward: number;
}
export const SPPrize: React.FC<SPPrizeProps> = ({ challengeType, spReward }) => {
    return (
        <span className={classNames(`w-fit relative`)}>
            <span
                className={classNames('absolute z-50', {
                    'subheading-one top-2.5 left-[30px]': spReward > 0 && spReward < 100,
                    'subheading-one top-2.5 left-[24px]': spReward > 99 && spReward < 1000,
                    'subheading-one top-2.5 left-[20px]': spReward === 300,
                    'subheading-one top-2.5 left-4 uppercase': spReward > 999 && spReward !== 99999,
                    'detail-one top-3 left-4 uppercase': spReward === 99999,
                    'text-white': challengeType !== 'ROTATING',
                    'text-black': challengeType === 'ROTATING',
                })}
            >
                {spReward === 99999 ? 'Owned Player' : spReward}
            </span>
            {spReward !== 99999 && (
                <span className="absolute top-8 left-[32px] z-50">
                    {challengeType !== 'ROTATING' ? <SPIcon size="xs" color="white" /> : <SPIcon size="xs" color="black" />}
                </span>
            )}
            {challengeType === 'DAILY' && (
                <svg width="84" height="50" viewBox="0 0 84 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3933 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94744 43.7493C5.24187 43.7493 4.63786 43.4981 4.13541 42.9956C3.63295 42.4932 3.38173 41.8892 3.38173 41.1836L5.38173 30.8133L1.44764 26.8615C0.963005 26.3679 0.720688 25.767 0.720688 25.0588C0.720688 24.3506 0.963005 23.7542 1.44764 23.2695L5.38173 19.3178L3.38173 8.94745C3.38173 8.24188 3.63295 7.63787 4.13541 7.13542C4.63786 6.63297 5.24187 6.38174 5.94744 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4196 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4103 24.3641 83.4103 25.0722C83.4103 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493Z"
                        fill="#5688FC"
                    />
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3934 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94745 43.7493C5.24188 43.7493 4.63787 43.4981 4.13542 42.9956C3.63297 42.4932 3.38174 41.8892 3.38174 41.1836L5.38174 30.8133L1.44765 26.8615C0.963021 26.3679 0.720703 25.767 0.720703 25.0588C0.720703 24.3506 0.963021 23.7542 1.44765 23.2695L5.38174 19.3178L3.38174 8.94745C3.38174 8.24188 3.63297 7.63787 4.13542 7.13542C4.63787 6.63297 5.24188 6.38174 5.94745 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4197 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4104 24.3641 83.4104 25.0722C83.4104 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493ZM43.1083 46.7591L55.723 40.1836L78.1836 41.1836L76.1836 29.7266L80.8447 25.0655L76.1836 20.4045L78.1836 8.94745L55.7266 9.94745L43.1083 3.28641L28.4045 9.94745L5.94745 8.94745L7.94745 20.4045L3.28641 25.0655L7.94745 29.7266L5.94745 41.1836L28.3617 40.1836L43.1083 46.7591Z"
                        fill="#282828"
                    />
                </svg>
            )}
            {challengeType === 'WEEKLY' && (
                <svg width="84" height="50" viewBox="0 0 84 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3933 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94744 43.7493C5.24187 43.7493 4.63786 43.4981 4.13541 42.9956C3.63295 42.4932 3.38173 41.8892 3.38173 41.1836L5.38173 30.8133L1.44764 26.8615C0.963005 26.3679 0.720688 25.767 0.720688 25.0588C0.720688 24.3506 0.963005 23.7542 1.44764 23.2695L5.38173 19.3178L3.38173 8.94745C3.38173 8.24188 3.63295 7.63787 4.13541 7.13542C4.63786 6.63297 5.24187 6.38174 5.94744 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4196 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4103 24.3641 83.4103 25.0722C83.4103 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493Z"
                        fill="#D13DC2"
                    />
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3934 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94745 43.7493C5.24188 43.7493 4.63787 43.4981 4.13542 42.9956C3.63297 42.4932 3.38174 41.8892 3.38174 41.1836L5.38174 30.8133L1.44765 26.8615C0.963021 26.3679 0.720703 25.767 0.720703 25.0588C0.720703 24.3506 0.963021 23.7542 1.44765 23.2695L5.38174 19.3178L3.38174 8.94745C3.38174 8.24188 3.63297 7.63787 4.13542 7.13542C4.63787 6.63297 5.24188 6.38174 5.94745 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4197 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4104 24.3641 83.4104 25.0722C83.4104 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493ZM43.1083 46.7591L55.723 40.1836L78.1836 41.1836L76.1836 29.7266L80.8447 25.0655L76.1836 20.4045L78.1836 8.94745L55.7266 9.94745L43.1083 3.28641L28.4045 9.94745L5.94745 8.94745L7.94745 20.4045L3.28641 25.0655L7.94745 29.7266L5.94745 41.1836L28.3617 40.1836L43.1083 46.7591Z"
                        fill="#282828"
                    />
                </svg>
            )}
            {(challengeType === 'BI-SEASONAL' || challengeType === 'TRAINING') && (
                <svg width="84" height="50" viewBox="0 0 84 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3934 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94745 43.7493C5.24188 43.7493 4.63787 43.4981 4.13542 42.9956C3.63297 42.4932 3.38174 41.8892 3.38174 41.1836L5.38174 30.8133L1.44765 26.8615C0.963021 26.3679 0.720703 25.767 0.720703 25.0588C0.720703 24.3506 0.963021 23.7542 1.44765 23.2695L5.38174 19.3178L3.38174 8.94745C3.38174 8.24188 3.63297 7.63787 4.13542 7.13542C4.63787 6.63297 5.24188 6.38174 5.94745 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4197 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4104 24.3641 83.4104 25.0722C83.4104 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493Z"
                        fill="#F44336"
                    />
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3934 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94745 43.7493C5.24188 43.7493 4.63787 43.4981 4.13542 42.9956C3.63297 42.4932 3.38174 41.8892 3.38174 41.1836L5.38174 30.8133L1.44765 26.8615C0.963021 26.3679 0.720703 25.767 0.720703 25.0588C0.720703 24.3506 0.963021 23.7542 1.44765 23.2695L5.38174 19.3178L3.38174 8.94745C3.38174 8.24188 3.63297 7.63787 4.13542 7.13542C4.63787 6.63297 5.24188 6.38174 5.94745 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4197 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4104 24.3641 83.4104 25.0722C83.4104 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493ZM43.1083 46.7591L55.723 40.1836L78.1836 41.1836L76.1836 29.7266L80.8447 25.0655L76.1836 20.4045L78.1836 8.94745L55.7266 9.94745L43.1083 3.28641L28.4045 9.94745L5.94745 8.94745L7.94745 20.4045L3.28641 25.0655L7.94745 29.7266L5.94745 41.1836L28.3617 40.1836L43.1083 46.7591Z"
                        fill="#282828"
                    />
                </svg>
            )}
            {(challengeType === 'SEASONAL' || challengeType === 'ROTATING') && (
                <svg width="84" height="50" viewBox="0 0 84 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3934 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94745 43.7493C5.24188 43.7493 4.63787 43.4981 4.13542 42.9956C3.63297 42.4932 3.38174 41.8892 3.38174 41.1836L5.38174 30.8133L1.44765 26.8615C0.963021 26.3679 0.720703 25.767 0.720703 25.0588C0.720703 24.3506 0.963021 23.7542 1.44765 23.2695L5.38174 19.3178L3.38174 8.94745C3.38174 8.24188 3.63297 7.63787 4.13542 7.13542C4.63787 6.63297 5.24188 6.38174 5.94745 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4197 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4104 24.3641 83.4104 25.0722C83.4104 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493Z"
                        fill="#F0CA00"
                    />
                    <path
                        d="M56.7956 42.7493L44.9043 48.5979C44.4107 49.0825 43.8098 49.3248 43.1016 49.3248C42.3934 49.3248 41.7969 49.0825 41.3123 48.5979L27.3424 42.7493L5.94745 43.7493C5.24188 43.7493 4.63787 43.4981 4.13542 42.9956C3.63297 42.4932 3.38174 41.8892 3.38174 41.1836L5.38174 30.8133L1.44765 26.8615C0.963021 26.3679 0.720703 25.767 0.720703 25.0588C0.720703 24.3506 0.963021 23.7542 1.44765 23.2695L5.38174 19.3178L3.38174 8.94745C3.38174 8.24188 3.63297 7.63787 4.13542 7.13542C4.63787 6.63297 5.24188 6.38174 5.94745 6.38174L27.3178 7.38174L41.2695 1.44765C41.7705 0.96302 42.3804 0.720703 43.0991 0.720703C43.8179 0.720703 44.4197 0.977274 44.9043 1.49042L56.7956 7.38174L78.1836 6.38174C78.8892 6.38174 79.4932 6.63297 79.9956 7.13542C80.4981 7.63787 80.7493 8.24188 80.7493 8.94745L78.7493 19.3178L82.6834 23.2695C83.168 23.7631 83.4104 24.3641 83.4104 25.0722C83.4104 25.7805 83.168 26.3769 82.6834 26.8615L78.7493 30.8133L80.7493 41.1836C80.7493 41.8892 80.4981 42.4932 79.9956 42.9956C79.4932 43.4981 78.8892 43.7493 78.1836 43.7493L56.7956 42.7493ZM43.1083 46.7591L55.723 40.1836L78.1836 41.1836L76.1836 29.7266L80.8447 25.0655L76.1836 20.4045L78.1836 8.94745L55.7266 9.94745L43.1083 3.28641L28.4045 9.94745L5.94745 8.94745L7.94745 20.4045L3.28641 25.0655L7.94745 29.7266L5.94745 41.1836L28.3617 40.1836L43.1083 46.7591Z"
                        fill="#282828"
                    />
                </svg>
            )}
        </span>
    );
};
