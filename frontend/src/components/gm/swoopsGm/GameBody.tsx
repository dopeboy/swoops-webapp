import React from 'react';
import { useRouter } from 'next/router';
interface IProps {
    game: any;
}

const GameBody = (props: IProps) => {
    const { game } = props;
    const router = useRouter();

    const rowClickHandler = (): void => {
        const pathPrefix = game.is_posted === false ? '/gm/pending/' : '/gm/completed/';
        router.push(`${pathPrefix}/${game.uuid}`);
    };

    return (
        <tr className="hover:cursor-pointer hover:bg-off-black/40 border-b border-white/16 border-solid" onClick={rowClickHandler}>
            <td align="left" className="py-3.5 md:py-5 align-center whitespace-nowrap px-4 md:px-6">
                {game.challenge?.date}
            </td>
            <td align="left" className="py-3.5 md:py-5 align-center px-3 md:px-4 font-display text-xs lg:text-lg xl:text-lg 2xl:text-lg">
                <div className="whitespace-nowrap w-28 lg:w-full xl:w-full 2xl:w-full text-ellipsis overflow-hidden ">
                    {game.challenge?.description}
                </div>
            </td>
            <td
                align="left"
                className="py-3.5 md:py-5 align-center px-3 md:px-4 font-display font-extrabold text-xs lg:text-lg xl:text-lg 2xl:text-lg"
            >
                <div className="whitespace-nowrap w-28 lg:w-full xl:w-full 2xl:w-full text-ellipsis overflow-hidden ">
                    {game.is_posted === false ? (
                        '-'
                    ) : game.is_user_winner === true ? (
                        <div className="w-fit rounded-lg px-2 pt-3 pb-2.5 leading-[0.5em] subheading-three text-black bg-assist-green">WIN</div>
                    ) : (
                        <div className="w-fit rounded-lg px-2 pt-3 pb-2.5 leading-[0.5em] subheading-three text-white bg-defeat-red">LOSS</div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default GameBody;
