import classNames from 'classnames';
import Image from 'next/image';

interface SPBadgeProps {
    level: number;
    isMaxLevel: boolean;
    isTopOne?: boolean;
}
export const SPBadge: React.FC<SPBadgeProps> = ({ isTopOne, isMaxLevel, level }) => {
    return (
        <div className={classNames(`w-full relative`)}>
            {!isMaxLevel && (
                <span
                    className={classNames('absolute z-8 text-off-black', {
                        'w-full h-full inset-y-1/3 xl:inset-y-[13px] inset-x-0 detail-one text-[10px]': level >= 1 && level <= 9,
                        'w-full h-full inset-y-[15px] xl:inset-y-[13px] inset-x-0 detail-one text-[8px]': level > 9 && level <= 19,
                        'w-full h-full inset-y-[17px] xl:inset-y-[13px] inset-x-0 detail-one text-[6px]': level >= 20,
                    })}
                >
                    {level}
                </span>
            )}
            {isMaxLevel && <Image src={'/images/sp_badges/max_level_badge.svg'} width={38} height={38} />}
            {!isTopOne && !isMaxLevel && level >= 0 && level <= 3 && (
                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22677C6.52119 32.0286 5.91718 31.7774 5.41473 31.2749C4.91228 30.7725 4.66106 30.1685 4.66106 29.4629V24.0926L0.726967 20.1408C0.242332 19.6472 1.52588e-05 19.0463 1.52588e-05 18.3381C1.52588e-05 17.6299 0.242332 17.0335 0.726967 16.5488L4.66106 12.5971V7.22675C4.66106 6.52118 4.91228 5.91717 5.41473 5.41472C5.91718 4.91227 6.52119 4.66104 7.22677 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3785 0C19.0973 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.275 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4474 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4474 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.275 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749Z"
                        fill="#5688FC"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749ZM18.3876 34.0384L23.0023 29.4629H29.4629V23.0059L34.1239 18.3448L29.4629 13.6838V7.22675H23.0059L18.3876 2.56571L13.6838 7.22675H7.22675V13.6838L2.56571 18.3448L7.22675 23.0059V29.4629H13.641L18.3876 34.0384Z"
                        fill="#282828"
                    />
                    <path
                        d="M13.0582 11.6375L12.8553 10.2793H14.3711L14.9042 11.4162C15.1615 11.9648 15.5476 12.4439 16.0277 12.8122C17.3502 13.8268 19.1865 13.8577 20.5405 12.88C21.1116 12.4676 21.556 11.9037 21.8235 11.2519L22.2226 10.2793H23.6579L23.4174 11.4873C23.3143 12.005 23.3099 12.5374 23.4043 13.0567L23.4811 13.4793C23.7559 14.9908 24.5614 16.3546 25.7524 17.3251L26.2793 17.7544V26.2793H10.2793V17.7544L10.6423 17.4587C11.9461 16.3963 12.7978 14.8783 13.025 13.2119L13.0663 12.9094C13.1239 12.4872 13.1211 12.0589 13.0582 11.6375ZM22.3952 9.85878C22.3951 9.85896 22.395 9.85914 22.3949 9.85932L22.3952 9.85878L21.768 9.60143L22.3952 9.85878ZM26.5275 17.9566C26.5272 17.9564 26.5269 17.9561 26.5266 17.9559L26.5275 17.9566ZM10.0238 17.9626L10.0243 17.9622C10.0241 17.9624 10.0239 17.9625 10.0238 17.9626L9.58557 17.4248L10.0238 17.9626Z"
                        fill="#F2F2F2"
                        stroke="#4E4E4E"
                        strokeWidth="2"
                    />
                    <path
                        d="M14.5493 21.576L18.7093 18.016H21.2053V21.328H22.4453V22.864H21.2053V24H18.9413V22.864H14.5493V21.576ZM18.9413 21.328V19.552L16.8613 21.328H18.9413Z"
                        fill="#4E4E4E"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22677C6.52119 32.0286 5.91718 31.7774 5.41473 31.2749C4.91228 30.7725 4.66106 30.1685 4.66106 29.4629V24.0926L0.726967 20.1408C0.242332 19.6472 1.52588e-05 19.0463 1.52588e-05 18.3381C1.52588e-05 17.6299 0.242332 17.0335 0.726967 16.5488L4.66106 12.5971V7.22675C4.66106 6.52118 4.91228 5.91717 5.41473 5.41472C5.91718 4.91227 6.52119 4.66104 7.22677 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3785 0C19.0973 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.275 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4474 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4474 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.275 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749Z"
                        fill="#5688FC"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749ZM18.3876 34.0384L23.0023 29.4629H29.4629V23.0059L34.1239 18.3448L29.4629 13.6838V7.22675H23.0059L18.3876 2.56571L13.6838 7.22675H7.22675V13.6838L2.56571 18.3448L7.22675 23.0059V29.4629H13.641L18.3876 34.0384Z"
                        fill="#282828"
                    />
                    <path
                        d="M13.0582 11.6375L12.8553 10.2793H14.3711L14.9042 11.4162C15.1615 11.9648 15.5476 12.4439 16.0277 12.8122C17.3502 13.8268 19.1865 13.8577 20.5405 12.88C21.1116 12.4676 21.556 11.9037 21.8235 11.2519L22.2226 10.2793H23.6579L23.4174 11.4873C23.3143 12.005 23.3099 12.5374 23.4043 13.0567L23.4811 13.4793C23.7559 14.9908 24.5614 16.3546 25.7524 17.3251L26.2793 17.7544V26.2793H10.2793V17.7544L10.6423 17.4587C11.9461 16.3963 12.7978 14.8783 13.025 13.2119L13.0663 12.9094C13.1239 12.4872 13.1211 12.0589 13.0582 11.6375ZM22.3952 9.85878C22.3951 9.85896 22.395 9.85914 22.3949 9.85932L22.3952 9.85878L21.768 9.60143L22.3952 9.85878ZM26.5275 17.9566C26.5272 17.9564 26.5269 17.9561 26.5266 17.9559L26.5275 17.9566ZM10.0238 17.9626L10.0243 17.9622C10.0241 17.9624 10.0239 17.9625 10.0238 17.9626L9.58557 17.4248L10.0238 17.9626Z"
                        fill="#F2F2F2"
                        stroke="#4E4E4E"
                        strokeWidth="2"
                    />
                </svg>
            )}
            {!isTopOne && !isMaxLevel && level >= 4 && level <= 11 && (
                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749Z"
                        fill="#D13DC2"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749ZM18.3876 34.0384L23.0023 29.4629H29.4629V23.0059L34.1239 18.3448L29.4629 13.6838V7.22675H23.0059L18.3876 2.56571L13.6838 7.22675H7.22675V13.6838L2.56571 18.3448L7.22675 23.0059V29.4629H13.641L18.3876 34.0384Z"
                        fill="#282828"
                    />
                    <path
                        d="M13.0582 11.6375L12.8553 10.2793H14.371L14.9042 11.4162C15.1615 11.9648 15.5476 12.4439 16.0277 12.8122C17.3501 13.8268 19.1865 13.8577 20.5405 12.88C21.1116 12.4676 21.556 11.9037 21.8234 11.2519L22.2226 10.2793H23.6579L23.4174 11.4873C23.3143 12.005 23.3098 12.5374 23.4043 13.0567L23.4811 13.4793C23.7559 14.9908 24.5613 16.3546 25.7524 17.3251L26.2793 17.7544V26.2793H10.2793V17.7544L10.6423 17.4587C11.9461 16.3963 12.7978 14.8783 13.025 13.2119L13.0663 12.9094C13.1238 12.4872 13.1211 12.0589 13.0582 11.6375ZM22.3952 9.85878C22.3951 9.85896 22.395 9.85914 22.3949 9.85932L22.3952 9.85878L21.768 9.60143L22.3952 9.85878ZM26.5274 17.9566C26.5271 17.9564 26.5268 17.9561 26.5265 17.9559L26.5274 17.9566ZM10.0238 17.9626L10.0242 17.9622C10.0241 17.9624 10.0239 17.9625 10.0238 17.9626L9.58555 17.4248L10.0238 17.9626Z"
                        fill="#F2F2F2"
                        stroke="#4E4E4E"
                        strokeWidth="2"
                    />
                </svg>
            )}
            {!isTopOne && !isMaxLevel && level >= 12 && level <= 18 && (
                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749Z"
                        fill="#F44336"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749ZM18.3876 34.0384L23.0023 29.4629H29.4629V23.0059L34.1239 18.3448L29.4629 13.6838V7.22675H23.0059L18.3876 2.56571L13.6838 7.22675H7.22675V13.6838L2.56571 18.3448L7.22675 23.0059V29.4629H13.641L18.3876 34.0384Z"
                        fill="#282828"
                    />
                    <path
                        d="M13.0582 11.6375L12.8553 10.2793H14.3711L14.9042 11.4162C15.1615 11.9648 15.5476 12.4439 16.0277 12.8122C17.3502 13.8268 19.1865 13.8577 20.5405 12.88C21.1116 12.4676 21.556 11.9037 21.8235 11.2519L22.2226 10.2793H23.6579L23.4174 11.4873C23.3143 12.005 23.3099 12.5374 23.4043 13.0567L23.4811 13.4793C23.7559 14.9908 24.5614 16.3546 25.7524 17.3251L26.2793 17.7544V26.2793H10.2793V17.7544L10.6423 17.4587C11.9461 16.3963 12.7978 14.8783 13.025 13.2119L13.0663 12.9094C13.1239 12.4872 13.1211 12.0589 13.0582 11.6375ZM22.3952 9.85878C22.3951 9.85896 22.395 9.85914 22.3949 9.85932L22.3952 9.85878L21.768 9.60143L22.3952 9.85878ZM26.5275 17.9566C26.5272 17.9564 26.5269 17.9561 26.5266 17.9559L26.5275 17.9566ZM10.0238 17.9626L10.0243 17.9622C10.0241 17.9624 10.0239 17.9625 10.0238 17.9626L9.58557 17.4248L10.0238 17.9626Z"
                        fill="#F2F2F2"
                        stroke="#4E4E4E"
                        strokeWidth="2"
                    />
                </svg>
            )}
            {!isTopOne && !isMaxLevel && level >= 19 && level <= 22 && (
                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749Z"
                        fill="#F0CA00"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749ZM18.3876 34.0384L23.0023 29.4629H29.4629V23.0059L34.1239 18.3448L29.4629 13.6838V7.22675H23.0059L18.3876 2.56571L13.6838 7.22675H7.22675V13.6838L2.56571 18.3448L7.22675 23.0059V29.4629H13.641L18.3876 34.0384Z"
                        fill="#282828"
                    />
                    <path
                        d="M13.0582 11.6375L12.8553 10.2793H14.371L14.9042 11.4162C15.1615 11.9648 15.5476 12.4439 16.0277 12.8122C17.3501 13.8268 19.1865 13.8577 20.5405 12.88C21.1116 12.4676 21.556 11.9037 21.8234 11.2519L22.2226 10.2793H23.6579L23.4174 11.4873C23.3143 12.005 23.3098 12.5374 23.4043 13.0567L23.4811 13.4793C23.7559 14.9908 24.5613 16.3546 25.7524 17.3251L26.2793 17.7544V26.2793H10.2793V17.7544L10.6423 17.4587C11.9461 16.3963 12.7978 14.8783 13.025 13.2119L13.0663 12.9094C13.1238 12.4872 13.1211 12.0589 13.0582 11.6375ZM22.3952 9.85878C22.3951 9.85896 22.395 9.85914 22.3949 9.85932L22.3952 9.85878L21.768 9.60143L22.3952 9.85878ZM26.5274 17.9566C26.5271 17.9564 26.5268 17.9561 26.5265 17.9559L26.5274 17.9566ZM10.0238 17.9626L10.0242 17.9622C10.0241 17.9624 10.0239 17.9625 10.0238 17.9626L9.58555 17.4248L10.0238 17.9626Z"
                        fill="#F2F2F2"
                        stroke="#4E4E4E"
                        strokeWidth="2"
                    />
                </svg>
            )}
            {isTopOne && !isMaxLevel && (
                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749Z"
                        fill="#13FF0D"
                    />
                    <path
                        d="M24.0749 32.0286L20.1836 35.8772C19.69 36.3618 19.0891 36.6041 18.3809 36.6041C17.6727 36.6041 17.0762 36.3618 16.5916 35.8772L12.6217 32.0286H7.22675C6.52118 32.0286 5.91717 31.7774 5.41472 31.2749C4.91227 30.7725 4.66104 30.1685 4.66104 29.4629V24.0926L0.726951 20.1408C0.242317 19.6472 0 19.0463 0 18.3381C0 17.6299 0.242317 17.0335 0.726951 16.5488L4.66104 12.5971V7.22675C4.66104 6.52118 4.91227 5.91717 5.41472 5.41472C5.91717 4.91227 6.52118 4.66104 7.22675 4.66104H12.5971L16.5488 0.726951C17.0498 0.242317 17.6597 0 18.3784 0C19.0972 0 19.699 0.256571 20.1836 0.769713L24.0749 4.66104H29.4629C30.1685 4.66104 30.7725 4.91227 31.2749 5.41472C31.7774 5.91717 32.0286 6.52118 32.0286 7.22675V12.5971L35.9627 16.5488C36.4473 17.0424 36.6897 17.6433 36.6897 18.3515C36.6897 19.0598 36.4473 19.6562 35.9627 20.1408L32.0286 24.0926V29.4629C32.0286 30.1685 31.7774 30.7725 31.2749 31.2749C30.7725 31.7774 30.1685 32.0286 29.4629 32.0286H24.0749ZM18.3876 34.0384L23.0023 29.4629H29.4629V23.0059L34.1239 18.3448L29.4629 13.6838V7.22675H23.0059L18.3876 2.56571L13.6838 7.22675H7.22675V13.6838L2.56571 18.3448L7.22675 23.0059V29.4629H13.641L18.3876 34.0384Z"
                        fill="#282828"
                    />
                    <path
                        d="M26.2793 17.7544V26.2793H10.2793V17.7544L10.6423 17.4587C11.9461 16.3963 12.7978 14.8783 13.025 13.2119L13.0663 12.9094C13.1238 12.4872 13.1211 12.0589 13.0582 11.6375L12.8553 10.2793H14.371L14.9042 11.4162C15.1615 11.9648 15.5476 12.4439 16.0277 12.8122C17.3501 13.8268 19.1865 13.8577 20.5405 12.88C21.1116 12.4676 21.556 11.9037 21.8234 11.2519L22.2226 10.2793H23.6579L23.4174 11.4873C23.3143 12.005 23.3098 12.5374 23.4043 13.0567L23.4811 13.4793C23.7559 14.9908 24.5613 16.3546 25.7524 17.3251L26.2793 17.7544Z"
                        fill="#F2F2F2"
                        stroke="#4E4E4E"
                        strokeWidth="2"
                    />
                </svg>
            )}
        </div>
    );
};