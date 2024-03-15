import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { ApiService, PlayerNameChangeRequest } from 'src/lib/api';
import Button from '../common/button/Button';
import { ChipPosition, ColorTheme } from '../common/button/types';
import { RenameModal } from '../common/RenameModal';
import { toast } from 'react-toastify';
import { BlackAndWhiteButton } from '../BlackAndWhiteButton';
import { RenamePlayerInput } from './RenamePlayerInput';
import { RenamePlayerErrorNotice } from './RenamePlayerErrorNotice';
import { RenamePlayerInputLabels } from './RenamePlayerInputLabels';

interface RenamePlayerModalProps {
    playerId: string;
    open: boolean;
    userRequestedNewName?: string;
    namingStatus: PlayerNameChangeRequest.status;
    setOpen: (openValue: boolean) => void;
}

enum RenamePlayerStepEnum {
    RENAME_PLAYER = 'RENAME_PLAYER',
    CONFIRM_RENAME = 'CONFIRM_RENAME',
    RENAME_PENDING_APPROVAL = 'RENAME_PENDING_APPROVAL',
    CANCEL_PENDING_RENAME = 'CANCEL_PENDING_RENAME',
    PLAYER_ALREADY_RENAMED = 'PLAYER_ALREADY_RENAMED',
}
export const RenamePlayerModal: React.FC<RenamePlayerModalProps> = ({ open, setOpen, playerId, namingStatus, userRequestedNewName }) => {
    const [step, setStep] = useState<RenamePlayerStepEnum>(RenamePlayerStepEnum.RENAME_PLAYER);
    const [newNameInputValue, setNewNameInputValue] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const nameRequirements = [
        'Be unique',
        'Be appropriate',
        'Be at least 2 characters long, and at most 16 characters long',
        'Not contain special characters, numbers or diacritics',
    ];

    useEffect(() => {
        if (namingStatus === PlayerNameChangeRequest.status.PENDING) {
            setStep(RenamePlayerStepEnum.RENAME_PENDING_APPROVAL);
        } else if (namingStatus === PlayerNameChangeRequest.status.ACCEPTED) {
            setStep(RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED);
        } else {
            setStep(RenamePlayerStepEnum.RENAME_PLAYER);
        }
    }, [open, namingStatus]);

    useEffect(() => {
        if (open && step === RenamePlayerStepEnum.RENAME_PLAYER && newNameInputValue?.length > 0) {
            validatePlayerName();
        }
    }, [newNameInputValue]);

    const handleSubmit = async (): Promise<void> => {
        try {
            if (!loadingRequest && playerId) {
                setLoadingRequest(true);
                const createdRequest = await ApiService.apiGamePlayerTokenNameCreate(playerId, {
                    name: newNameInputValue.trim().toUpperCase(),
                });
                if (createdRequest) {
                    toast.success("Your rename request has been submitted. You're almost there!");
                    setStep(RenamePlayerStepEnum.RENAME_PENDING_APPROVAL);
                }
                setLoadingRequest(false);
            }
        } catch (e) {
            setLoadingRequest(false);
            if (e.body && e.body.name && e.body.name.length > 0) {
                toast.error(e.body.name[0]);
            } else if (e.body && e.body.non_field_errors && e.body.non_field_errors.length > 0) {
                toast.error(e.body.non_field_errors[0]);
            } else {
                toast.error('An error occurred while submitting your rename request.');
            }
        }
    };

    const hasValidationErrors = (): boolean => error.length > 0;

    const handleCancellation = async (): Promise<void> => {
        try {
            if (!loadingRequest && playerId) {
                setLoadingRequest(true);
                const cancelRequest = await ApiService.apiGamePlayerTokenNameDelete(playerId);
                if (cancelRequest) {
                    setStep(RenamePlayerStepEnum.RENAME_PLAYER);
                    toast.success('Your rename request has been cancelled.');
                    closeModal();
                }
                setLoadingRequest(false);
            }
        } catch (e) {
            setLoadingRequest(false);
            toast.error('There was an error attempting to cancel your player rename. Please try again later.');
            setError(e.message);
        }
    };

    const validatePlayerName = (validationOnly = false): boolean => {
        const trimmedName = newNameInputValue.trim();
        if (trimmedName.length > 0 && trimmedName.length < 2) {
            if (!validationOnly) setError("Please enter a name that's at least 2 characters long.");
            return false;
        }
        if (trimmedName.length > 16) {
            if (!validationOnly) setError("Please enter a name that's at most 16 characters long.");
            return false;
        }
        if (trimmedName.match(/[^a-zA-Z ]/)) {
            if (!validationOnly) setError("Please enter a name that doesn't contain special characters, numbers or diacritics.");
            return false;
        }
        if (trimmedName.match(/\s{2,}/)) {
            if (!validationOnly) setError('Please enter a name that has at most 1 space between characters');
            return false;
        }
        if (!validationOnly) setError('');
        return true;
    };

    const shouldAllowSubmit = (validationOnly = false): boolean => validatePlayerName(validationOnly) && newNameInputValue.trim().length > 0;

    const closeModal = (): void => {
        setTimeout(() => {
            setNewNameInputValue('');
            if (step === RenamePlayerStepEnum.CANCEL_PENDING_RENAME) {
                setStep(RenamePlayerStepEnum.RENAME_PENDING_APPROVAL);
            } else if (step === RenamePlayerStepEnum.CONFIRM_RENAME) {
                setStep(RenamePlayerStepEnum.RENAME_PLAYER);
            }
            setError('');
        }, 200);
        setOpen(false);
    };

    const changeStep = (): void => {
        switch (step) {
            case RenamePlayerStepEnum.RENAME_PLAYER:
                setStep(RenamePlayerStepEnum.CONFIRM_RENAME);
                break;
            case RenamePlayerStepEnum.CONFIRM_RENAME:
                setStep(RenamePlayerStepEnum.RENAME_PENDING_APPROVAL);
                break;
            case RenamePlayerStepEnum.RENAME_PENDING_APPROVAL:
                setStep(RenamePlayerStepEnum.CANCEL_PENDING_RENAME);
                break;
            case RenamePlayerStepEnum.CANCEL_PENDING_RENAME:
                setStep(RenamePlayerStepEnum.RENAME_PLAYER);
                break;
            case RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED:
                setStep(RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED);
                break;
        }
    };

    const getModalTitle = (): string => {
        switch (step) {
            case RenamePlayerStepEnum.RENAME_PLAYER:
                return 'Rename Player';
            case RenamePlayerStepEnum.CONFIRM_RENAME:
                return 'Confirm New Name';
            case RenamePlayerStepEnum.RENAME_PENDING_APPROVAL:
                return 'New Name Pending Approval';
            case RenamePlayerStepEnum.CANCEL_PENDING_RENAME:
                return 'Cancel Pending New Name';
            case RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED:
                return 'Player Already Renamed';
        }
    };

    const isInStep = (stepsToCheck: RenamePlayerStepEnum[]): boolean => stepsToCheck.includes(step);

    const subtitleChildren = (
        <>
            {isInStep([RenamePlayerStepEnum.RENAME_PLAYER]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Think carefully - you can only rename a player once!</div>
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
            {isInStep([RenamePlayerStepEnum.CONFIRM_RENAME]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Are you sure you've entered the name that you'll want forever?</div>
                    <div className="text-sm text-white/64 -mt-1 pt-0">Think carefully - you can only rename a player once!</div>
                </>
            )}
            {isInStep([RenamePlayerStepEnum.RENAME_PENDING_APPROVAL]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">
                        Thank you for submitting a new name for your player. All renames go through an approval process, and you'll receive email
                        notification when this name is accepted or rejected. You can cancel the pending new name up until it's approved.
                    </div>
                </>
            )}
            {isInStep([RenamePlayerStepEnum.CANCEL_PENDING_RENAME]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Are you sure you want to cancel the pending new name?</div>
                </>
            )}
            {isInStep([RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">This player's name has already been changed forever.</div>
                </>
            )}
        </>
    );

    const bodyChildren = (
        <>
            {isInStep([RenamePlayerStepEnum.RENAME_PLAYER]) && (
                <div className="flex flex-col items-start justify-start w-full gap-1">
                    <RenamePlayerInputLabels text="Name" isRequired hasValidationErrors={hasValidationErrors()} />
                    <RenamePlayerInput
                        onChange={(value: string) => setNewNameInputValue(value.toUpperCase())}
                        hasValidationErrors={hasValidationErrors()}
                        value={newNameInputValue}
                    />
                    <RenamePlayerErrorNotice error={error} />
                </div>
            )}
            {isInStep([
                RenamePlayerStepEnum.CONFIRM_RENAME,
                RenamePlayerStepEnum.RENAME_PENDING_APPROVAL,
                RenamePlayerStepEnum.CANCEL_PENDING_RENAME,
                RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED,
            ]) && (
                <div className="flex flex-row items-center w-full justify-start gap-5">
                    <div className="flex flex-col items-start justify-start gap-1">
                        <span className="text-sm font-semibold text-white">Previous Name</span>
                        <span className="text-sm uppercase text-white">{'SWOOPSTER-' + playerId}</span>
                    </div>
                    <div>
                        <ArrowRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start justify-start gap-1">
                        <span className="text-sm font-semibold text-white">New Name</span>
                        <span className="text-sm uppercase text-white">
                            {userRequestedNewName?.length ? userRequestedNewName : newNameInputValue}
                        </span>
                    </div>
                </div>
            )}
        </>
    );

    const footerChildren = (
        <>
            {isInStep([RenamePlayerStepEnum.RENAME_PLAYER]) && (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button onClick={() => closeModal()} className="subheading-two" colorTheme={ColorTheme.White}>
                        Cancel
                    </Button>
                    <Button
                        onClick={changeStep}
                        className="subheading-two disabled:subheading-two"
                        chipPosition={ChipPosition.Right}
                        colorTheme={ColorTheme.AssistGreen}
                        disabled={!shouldAllowSubmit(true)}
                    >
                        Rename
                    </Button>
                </div>
            )}
            {isInStep([RenamePlayerStepEnum.CONFIRM_RENAME]) && (
                <div className="flex flex-row items-center justify-end w-full gap-2">
                    <BlackAndWhiteButton text="Edit Name" onClick={() => setStep(RenamePlayerStepEnum.RENAME_PLAYER)} />
                    <Button
                        isLoading={loadingRequest}
                        className="subheading-two whitespace-nowrap"
                        chipPosition={ChipPosition.Right}
                        colorTheme={ColorTheme.AssistGreen}
                        onClick={() => handleSubmit()}
                    >
                        Confirm
                    </Button>
                </div>
            )}
            {isInStep([RenamePlayerStepEnum.RENAME_PENDING_APPROVAL]) && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                    <BlackAndWhiteButton text="Cancel" onClick={() => setStep(RenamePlayerStepEnum.CANCEL_PENDING_RENAME)} />
                    <Button onClick={() => closeModal()} className="subheading-two" colorTheme={ColorTheme.White}>
                        Close
                    </Button>
                </div>
            )}
            {isInStep([RenamePlayerStepEnum.PLAYER_ALREADY_RENAMED]) && (
                <div className="flex flex-row items-center justify-end w-full gap-2">
                    <Button onClick={() => closeModal()} className="subheading-two" colorTheme={ColorTheme.White}>
                        Close
                    </Button>
                </div>
            )}
            {isInStep([RenamePlayerStepEnum.CANCEL_PENDING_RENAME]) && (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button
                        onClick={() => setStep(RenamePlayerStepEnum.RENAME_PENDING_APPROVAL)}
                        className="subheading-two"
                        colorTheme={ColorTheme.White}
                    >
                        Don't Cancel It
                    </Button>
                    <Button
                        isLoading={loadingRequest}
                        className="subheading-two whitespace-nowrap"
                        chipPosition={ChipPosition.Right}
                        colorTheme={ColorTheme.AssistGreen}
                        onClick={() => handleCancellation()}
                    >
                        Cancel
                    </Button>
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
            setOpen={() => closeModal()}
        />
    );
};
