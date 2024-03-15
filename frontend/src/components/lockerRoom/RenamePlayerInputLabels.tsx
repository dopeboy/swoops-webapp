import classNames from 'classnames';

interface RenamePlayerInputLabelsProps {
    hasValidationErrors: boolean;
    isRequired: boolean;
    text: string;
}
export const RenamePlayerInputLabels: React.FC<RenamePlayerInputLabelsProps> = ({ text, hasValidationErrors, isRequired }) => {
    return (
        <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row items-center justify-start">
                <span
                    className={classNames('text-sm font-semibold', {
                        'text-defeat-red-text-on-black': hasValidationErrors,
                        'text-white': !hasValidationErrors,
                    })}
                >
                    {text}
                </span>
                {isRequired && <span className="text-sm text-assist-green">*</span>}
            </div>
            {isRequired && <span className="text-sm text-assist-green font-semibold">*Required</span>}
        </div>
    );
};
