interface NoticeDetailProps {
    text: string;
}

export const NoticeDetail: React.FC<NoticeDetailProps> = ({ text }) => (
    <span className="text-white leading-[1.1] tracking-[.04em] text-[14px] uppercase font-[700] text-center">{text}</span>
);
