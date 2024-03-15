export const Divider: React.FC = () => {
    return (
        <div className="w-full flex flex-col justify-center items-center gap-2.5 mt-2 mb-6">
            <div className="w-1/3 border-b-[1px] border-b-white/32"></div>
            <div className="flex flex-row items-center justify-center gap-3 w-1/2">
                <div className="rounded-full h-2 w-2 bg-white/32"></div>
                <div className="rounded-full h-2 w-2 bg-white/32"></div>
                <div className="rounded-full h-2 w-2 bg-white/32"></div>
            </div>
        </div>
    );
};
