import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import Button from '../common/button/Button';
import { ColorTheme } from '../common/button/types';
import { RenameModal } from '../common/RenameModal';
import classNames from 'classnames';
import { ApiService, TeamNameChangeRequest, Team } from 'src/lib/api';
import { toast } from 'react-toastify';

interface RenameTeamModalProps {
    namingStatus: TeamNameChangeRequest.status;
    team: Team;
    open: boolean;
    setOpen: (openValue: boolean, refresh: boolean, requestCancelled: boolean) => void;
    newTeamName?: string;
}

enum RenameTeamStepEnum {
    NAME_TEAM = 'NAME_TEAM',
    CONFIRM_TEAM_NAME = 'CONFIRM_TEAM_NAME',
    RENAME_PENDING_APPROVAL = 'RENAME_PENDING_APPROVAL',
    CANCEL_PENDING_REQUEST = 'CANCEL_PENDING_REQUEST',
    TEAM_ALREADY_NAMED = 'TEAM_ALREADY_NAMED',
}
export const RenameTeamModal: React.FC<RenameTeamModalProps> = ({ open, setOpen, namingStatus, team, newTeamName }) => {
    const [step, setStep] = useState<RenameTeamStepEnum>(RenameTeamStepEnum.NAME_TEAM);
    const [newName, setNewName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);

    const nameRequirements = [
        'Be unique',
        'Be appropriate',
        'Be at least 2 characters long, and at most 32 characters long',
        'Not contain special characters or diacritics',
        'Be in uppercase',
    ];

    useEffect(() => {
        if (namingStatus === TeamNameChangeRequest.status.PENDING) {
            setStep(RenameTeamStepEnum.RENAME_PENDING_APPROVAL);
        } else if (namingStatus === TeamNameChangeRequest.status.ACCEPTED) {
            setStep(RenameTeamStepEnum.TEAM_ALREADY_NAMED);
        } else {
            setStep(RenameTeamStepEnum.NAME_TEAM);
        }
    }, [namingStatus]);

    const closeModal = (refresh: boolean = false, requestCancelled: boolean = false) => {
        setNewName('');
        if (!requestCancelled) {
            if (step === RenameTeamStepEnum.CANCEL_PENDING_REQUEST) {
                setStep(RenameTeamStepEnum.RENAME_PENDING_APPROVAL);
            } else if (step === RenameTeamStepEnum.CONFIRM_TEAM_NAME) {
                setStep(RenameTeamStepEnum.NAME_TEAM);
            }
        }
        setError('');
        setOpen(false, refresh, requestCancelled);
    };

    useEffect(() => {
        if (open && step === RenameTeamStepEnum.NAME_TEAM) {
            validateTeamName();
        }
    }, [newName]);

    const handleSubmit = async () => {
        try {
            if (!loadingRequest) {
                setLoadingRequest(true);
                await ApiService.apiGameTeamNameUpdate(team.id, { name: newName.trim().toUpperCase() });
                setLoadingRequest(false);
                toast.success("Your name request has been submitted. You're almost there!");
                setStep(RenameTeamStepEnum.RENAME_PENDING_APPROVAL);
            }
        } catch (e) {
            setLoadingRequest(false);
        }
    };

    const handleCancellation = async () => {
        try {
            if (!loadingRequest && team.id) {
                setLoadingRequest(true);
                await ApiService.apiModerationTeamNameDelete(team.id.toString());
                setLoadingRequest(false);
                setStep(RenameTeamStepEnum.NAME_TEAM);
                toast.success('Your name request has been cancelled.');
                closeModal(true, true);
            }
        } catch (e) {
            setLoadingRequest(false);
            toast.error('There was an error attempting to cancel your team rename. Please try again later.');
            setError(e.message);
        }
    };

    const changeStep = () => {
        switch (step) {
            case RenameTeamStepEnum.NAME_TEAM:
                setStep(RenameTeamStepEnum.CONFIRM_TEAM_NAME);
                break;
            case RenameTeamStepEnum.CONFIRM_TEAM_NAME:
                setStep(RenameTeamStepEnum.RENAME_PENDING_APPROVAL);
                break;
            case RenameTeamStepEnum.RENAME_PENDING_APPROVAL:
                setStep(RenameTeamStepEnum.CANCEL_PENDING_REQUEST);
                break;
            case RenameTeamStepEnum.CANCEL_PENDING_REQUEST:
                setStep(RenameTeamStepEnum.NAME_TEAM);
                break;
            case RenameTeamStepEnum.TEAM_ALREADY_NAMED:
                setStep(RenameTeamStepEnum.TEAM_ALREADY_NAMED);
                break;
        }
    };

    const getModalTitle = () => {
        switch (step) {
            case RenameTeamStepEnum.NAME_TEAM:
                return 'Name Your Team';
            case RenameTeamStepEnum.CONFIRM_TEAM_NAME:
                return 'Confirm Team Name';
            case RenameTeamStepEnum.RENAME_PENDING_APPROVAL:
                return 'Team Name Pending Approval';
            case RenameTeamStepEnum.CANCEL_PENDING_REQUEST:
                return 'Cancel Pending Team Name';
            case RenameTeamStepEnum.TEAM_ALREADY_NAMED:
                return 'Team Already Named';
        }
    };

    const errorMsg = (trimmedName: string) => {
        if (trimmedName.length > 0 && trimmedName.length < 2) {
            return "Please enter a name that's at least 2 characters long.";
        }
        if (trimmedName.length > 32) {
            return "Please enter a name that's at most 32 characters long.";
        }
        if (trimmedName.match(/[^A-Za-z0-9\ ]/)) {
            return "Please enter a name that doesn't contain special characters or diacritics.";
        }
        if (trimmedName.match(/\s{2,}/)) {
            return 'Please enter a name that has at most 1 space between characters';
        }
        return '';
    };

    const validateTeamName = (validationOnly: boolean = false) => {
        const trimmedName = newName.trim();
        if (!trimmedName) {
            return false;
        }
        const msg = errorMsg(trimmedName);
        if (!validationOnly) {
            setError(msg);
        }
        return !msg;
    };

    const isInStep = (stepsToCheck: RenameTeamStepEnum[]) => stepsToCheck.includes(step);

    const subtitleChildren = (
        <>
            {isInStep([RenameTeamStepEnum.NAME_TEAM]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Think carefully - You can only name your team once per season!</div>
                    <div className="text-sm text-white/64 pt-0">Names must:</div>
                    <div className=" flex flex-col items-start justify-start m-0 p-0">
                        {nameRequirements.map((requirement) => (
                            <span
                                key={requirement}
                                className="text-sm text-white/64 px-2 pt-0 -mt-1 flex flex-row items-center justify-start gap-1.5"
                            >
                                <div className="h-1 w-1 bg-white/64 rounded-full"></div>
                                {requirement}
                            </span>
                        ))}
                    </div>
                </>
            )}
            {isInStep([RenameTeamStepEnum.CONFIRM_TEAM_NAME]) && (
                <>
                    <div className="text-sm text-white/64 -mt-1 pt-0">Think carefully - You can only name your team once per season!</div>
                </>
            )}
            {isInStep([RenameTeamStepEnum.RENAME_PENDING_APPROVAL]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">
                        Thank you for submitting a name for your team. All names go through an approval process, and you’ll receive email notification
                        when this name is accepted or rejected. You can cancel the request until it’s approved.
                    </div>
                </>
            )}
            {isInStep([RenameTeamStepEnum.CANCEL_PENDING_REQUEST]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Are you sure you want to cancel the request?</div>
                </>
            )}
        </>
    );

    const bodyChildren = (
        <>
            {isInStep([RenameTeamStepEnum.NAME_TEAM]) && (
                <div className="flex flex-col items-start justify-start w-full gap-1">
                    <div className="flex flex-row items-center justify-between w-full">
                        <div className="flex flex-row items-center justify-start">
                            <span
                                className={classNames('text-sm font-semibold', {
                                    'text-defeat-red-text-on-black': error.length > 0,
                                    'text-white': error.length === 0,
                                })}
                            >
                                Team Name
                            </span>
                            <span className="text-sm text-assist-green">*</span>
                        </div>
                        <span className="text-sm text-assist-green font-semibold">*Required</span>
                    </div>
                    <input
                        onChange={(e) => setNewName(e.target.value.toUpperCase())}
                        value={newName}
                        className={classNames('focus:outline-none placeholder:text-white/32 font-semibold text-base w-full rounded-md px-4 py-3', {
                            'bg-defeat-red/8 text-defeat-red-text-on-black': error.length > 0,
                            'bg-white/4 text-white': !error || error.length === 0,
                        })}
                        placeholder="Team Name"
                    />
                    {error && error?.length > 0 && (
                        <div className="flex flex-row items-center justify-start gap-1.5">
                            <ExclamationCircleIcon className="h-6 w-6 text-defeat-red-text-on-black" />
                            <span className="text-sm text-defeat-red-text-on-black font-semibold">{error}</span>
                        </div>
                    )}
                </div>
            )}
            {isInStep([
                RenameTeamStepEnum.CONFIRM_TEAM_NAME,
                RenameTeamStepEnum.RENAME_PENDING_APPROVAL,
                RenameTeamStepEnum.CANCEL_PENDING_REQUEST,
            ]) && (
                <div className="flex flex-row items-center w-full justify-start gap-5">
                    <div className="flex flex-col items-start justify-start gap-1">
                        <span className="text-sm font-semibold text-white">Team name</span>
                        <span className="text-sm text-white">{newName || newTeamName}</span>
                    </div>
                </div>
            )}
        </>
    );

    const footerChildren = (
        <>
            {isInStep([RenameTeamStepEnum.NAME_TEAM]) && (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button onClick={closeModal} className="subheading-two" colorTheme={ColorTheme.White}>
                        Close
                    </Button>
                    <Button
                        disabled={loadingRequest || !validateTeamName(true)}
                        onClick={changeStep}
                        colorTheme={ColorTheme.AssistGreen}
                        className={'subheading-two'}
                    >
                        Confirm
                    </Button>
                </div>
            )}
            {isInStep([RenameTeamStepEnum.CONFIRM_TEAM_NAME]) && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                    <button
                        onClick={() => setStep(RenameTeamStepEnum.NAME_TEAM)}
                        className="subheading-two h-[48px] px-8 text-white flex flex-col items-center justify-center border-2 border-white rounded-lg"
                    >
                        Edit Name
                    </button>
                    <div className="flex flex-row items-center justify-end gap-2">
                        <Button onClick={closeModal} className="subheading-two" colorTheme={ColorTheme.White}>
                            Cancel
                        </Button>
                        <button
                            onClick={() => {
                                if (validateTeamName()) {
                                    handleSubmit();
                                }
                            }}
                            className="btn-rounded-green px-8 subheading-two"
                        >
                            <span className={loadingRequest ? 'cursor-not-allowed opacity-10 text-black' : 'text-black'}>
                                {loadingRequest ? 'Loading...' : 'Confirm Team Name'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
            {isInStep([RenameTeamStepEnum.RENAME_PENDING_APPROVAL]) && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                    <button
                        onClick={() => setStep(RenameTeamStepEnum.CANCEL_PENDING_REQUEST)}
                        className="subheading-two h-[48px] px-8 text-white flex flex-col items-center justify-center border-2 border-white rounded-lg"
                    >
                        Cancel Request
                    </button>
                    <Button onClick={() => closeModal(true)} className="subheading-two" colorTheme={ColorTheme.White}>
                        Close
                    </Button>
                </div>
            )}
            {isInStep([RenameTeamStepEnum.CANCEL_PENDING_REQUEST]) && (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button
                        onClick={() => setStep(RenameTeamStepEnum.RENAME_PENDING_APPROVAL)}
                        className="subheading-two"
                        colorTheme={ColorTheme.White}
                    >
                        Don't Cancel It
                    </Button>
                    <button onClick={handleCancellation} className="btn-rounded-green px-8 subheading-two">
                        <span className={loadingRequest ? 'cursor-not-allowed opacity-10 text-black' : 'text-black'}>
                            {loadingRequest ? 'Loading...' : 'Cancel Request'}
                        </span>
                    </button>
                </div>
            )}
        </>
    );

    return (
        <RenameModal
            title={getModalTitle()}
            subtitleChildren={subtitleChildren}
            bodyChildren={bodyChildren}
            footerChildren={footerChildren}
            showCloseButton
            open={open}
            setOpen={closeModal}
        />
    );
};