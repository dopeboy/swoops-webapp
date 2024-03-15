interface ErrorDetailProps {
    text: string;
}

export const ErrorDetail: React.FC<ErrorDetailProps> = ({ text }) => (
    <span className="uppercase leading-[1.1] tracking-[.04em] text-[14px] font-[700] text-rose-500 text-center">{text}</span>
);
