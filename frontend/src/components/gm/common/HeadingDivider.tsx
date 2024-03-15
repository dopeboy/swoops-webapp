interface HeadingDividerProps {
    title: string;
}
export const HeadingDivider: React.FC<HeadingDividerProps> = ({ title }) => {
    return <div className="w-full flex justify-center heading-three sm:heading-two py-3 bg-white rounded-lg text-black mt-1.5 mb-3">{title}</div>;
};
