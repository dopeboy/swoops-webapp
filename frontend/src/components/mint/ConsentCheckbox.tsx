import { Typography } from '../common/Typography';

interface ConsentCheckboxProps {
    consent: boolean;
    setConsent: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({ consent, setConsent }) => {
    return (
        <div className="flex flex-row items-start justify-center gap-2 w-full px-4 max-w-lg">
            <input
                id="link-checkbox"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded-full mt-1 h-5 w-5 bg-transparent border border-white checked:bg-primary checked:focus:bg-primary checked:active:bg-primary checked:hover:bg-primary focus:outline-none focus:ring-0"
            />
            <label htmlFor="link-checkbox" className="max-w-lg">
                <Typography
                    text="I consent to receive commercial and/or marketing communications from Swoops"
                    variant="subheading-one"
                    align="left"
                    className="leading-[1.4]"
                />
            </label>
        </div>
    );
};
