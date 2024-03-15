import classNames from 'classnames';

interface RenamePlayerInputProps {
    value: string;
    onChange: (value: string) => void;
    hasValidationErrors: boolean;
}
export const RenamePlayerInput: React.FC<RenamePlayerInputProps> = ({ value, hasValidationErrors, onChange }) => {
    return (
        <input
            onChange={(e) => onChange(e.target.value)}
            value={value}
            className={classNames('focus:outline-none uppercase placeholder:text-white/32 font-semibold text-base w-full rounded-md px-4 py-3', {
                'bg-defeat-red/8 text-defeat-red-text-on-black': hasValidationErrors,
                'bg-white/4 text-white': !hasValidationErrors,
            })}
            placeholder="Will Slaprock"
        />
    );
};
