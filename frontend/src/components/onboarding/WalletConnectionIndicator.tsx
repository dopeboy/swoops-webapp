export const WalletConnectionIndicator: React.FC = () => (
    <div className="flex flex-row items-center justify-start gap-2">
        <div className="rounded-full h-2.5 w-2.5 bg-assist-green"></div>
        <span className="leading-[1.1] tracking-[.04em] uppercase text-[14px] font-[700] text-white">Wallet Connected</span>
    </div>
);
