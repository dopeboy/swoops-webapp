import { useState, useEffect } from 'react';
import Button from '../common/button/Button';
import { ColorTheme } from '../common/button/types';
import { RenameModal } from '../common/RenameModal';
import classNames from 'classnames';
import { ApiService, TeamLogoChangeRequest, Team } from 'src/lib/api';
import { toast } from 'react-toastify';
import axios from 'axios';

interface AddLogoModalProps {
    logoStatus: TeamLogoChangeRequest.status;
    team: Team;
    open: boolean;
    setOpen: (openValue: boolean, refresh: boolean, requestCancelled: boolean) => void;
}

enum AddLogoStepEnum {
    ADD_TEAM_LOGO = 'ADD_TEAM_LOGO',
    CONFIRM_LOGO = 'CONFIRM_LOGO',
    EDIT_LOGO_PENDING = 'EDIT_LOGO_PENDING',
    CANCEL_PENDING_REQUEST = 'CANCEL_PENDING_REQUEST',
    LOGO_ALREADY_ADDED = 'LOGO_ALREADY_ADDED',
}
const imageMimeType = /image\/(png|jpg|jpeg)/i;

export const AddLogoModal: React.FC<AddLogoModalProps> = ({ open, setOpen, logoStatus, team }) => {
    const [step, setStep] = useState<AddLogoStepEnum>(AddLogoStepEnum.ADD_TEAM_LOGO);
    const [file, setFile] = useState(null);
    const [fileDataURL, setFileDataURL] = useState(null);
    const [loadingRequest, setLoadingRequest] = useState(null);

    const nameRequirements = ['Be unique', 'Be appropriate', 'Should have max 8MB size', 'Should be square', 'Be at least 200x200'];

    const closeModal = (refresh = false, requestCancelled: boolean = false) => {
        setFileDataURL(null);
        if (step === AddLogoStepEnum.CANCEL_PENDING_REQUEST) {
            setStep(AddLogoStepEnum.EDIT_LOGO_PENDING);
        } else if (step === AddLogoStepEnum.CONFIRM_LOGO) {
            setStep(AddLogoStepEnum.ADD_TEAM_LOGO);
        }
        setOpen(false, refresh, requestCancelled);
    };

    useEffect(() => {
        let fileReader;
        let isCancel = false;
        if (file) {
            fileReader = new FileReader();
            fileReader.onload = (e) => {
                const { result } = e.target;
                const i = new Image();
                i.onload = () => {
                    if (i.width !== i.height) {
                        toast.error('Logo should be square');
                        return;
                    }
                    if (i.width < 200) {
                        toast.error('Logo should be at least 200x200');
                        return;
                    }
                    if (result && !isCancel) {
                        setFileDataURL(result);
                    }
                };
                i.src = result;
            };
            fileReader.readAsDataURL(file);
        }
        return () => {
            isCancel = true;
            if (fileReader && fileReader.readyState === 1) {
                fileReader.abort();
            }
        };
    }, [file]);

    useEffect(() => {
        if (logoStatus === TeamLogoChangeRequest.status.PENDING) {
            setStep(AddLogoStepEnum.EDIT_LOGO_PENDING);
        } else if (logoStatus === TeamLogoChangeRequest.status.ACCEPTED) {
            setStep(AddLogoStepEnum.LOGO_ALREADY_ADDED);
        } else {
            setStep(AddLogoStepEnum.ADD_TEAM_LOGO);
        }
    }, [logoStatus]);

    const handleSubmit = async () => {
        try {
            if (!loadingRequest) {
                setLoadingRequest(true);
                const { url, fields } = await ApiService.apiGameTeamLogoUploadCreate(team.id.toString());
                const payload = new FormData();
                Object.entries(fields).forEach(([key, val]) => {
                    payload.append(key, val);
                });
                payload.append('file', file);
                const { data: result } = await axios.post(url, payload);
                await ApiService.apiGameTeamLogoUpdate(team.id, { path: fields.key });
                setLoadingRequest(false);
                toast.success("Your logo request has been submitted. You're almost there!");
                setStep(AddLogoStepEnum.EDIT_LOGO_PENDING);
            }
        } catch (e) {
            setLoadingRequest(false);
            console.error(e);
        }
    };

    const handleCancellation = async () => {
        try {
            if (!loadingRequest && team.id) {
                setLoadingRequest(true);
                await ApiService.apiModerationTeamLogoDelete(team.id.toString());
                setLoadingRequest(false);
                setStep(AddLogoStepEnum.ADD_TEAM_LOGO);
                toast.success('Your logo request has been cancelled.');
                closeModal(true, true);
            }
        } catch (e) {
            setLoadingRequest(false);
            toast.error('There was an error attempting to cancel your add logo request. Please try again later.');
        }
    };

    const changeStep = () => {
        switch (step) {
            case AddLogoStepEnum.ADD_TEAM_LOGO:
                setStep(AddLogoStepEnum.CONFIRM_LOGO);
                break;
            case AddLogoStepEnum.CONFIRM_LOGO:
                setStep(AddLogoStepEnum.EDIT_LOGO_PENDING);
                break;
            case AddLogoStepEnum.EDIT_LOGO_PENDING:
                setStep(AddLogoStepEnum.CANCEL_PENDING_REQUEST);
                break;
            case AddLogoStepEnum.CANCEL_PENDING_REQUEST:
                setStep(AddLogoStepEnum.ADD_TEAM_LOGO);
                break;
            case AddLogoStepEnum.LOGO_ALREADY_ADDED:
                setStep(AddLogoStepEnum.LOGO_ALREADY_ADDED);
                break;
        }
    };

    const getModalTitle = () => {
        switch (step) {
            case AddLogoStepEnum.ADD_TEAM_LOGO:
                return 'Add Team Logo';
            case AddLogoStepEnum.CONFIRM_LOGO:
                return 'Confirm Team Logo';
            case AddLogoStepEnum.EDIT_LOGO_PENDING:
                return 'Logo Pending Approval';
            case AddLogoStepEnum.CANCEL_PENDING_REQUEST:
                return 'Cancel Pending Logo';
            case AddLogoStepEnum.LOGO_ALREADY_ADDED:
                return 'Logo Already Added';
        }
    };

    const isInStep = (stepsToCheck: AddLogoStepEnum[]) => stepsToCheck.includes(step);

    const changeLogoHandler = (e) => {
        const file = e.target.files[0];
        if (!file.type.match(imageMimeType)) {
            toast.error('Please upload with png, jpg or jpeg format');
            return;
        }
        if (file.size > 8e6) {
            toast.error('Please upload a file smaller than 8 MB');
            return;
        }
        setFile(file);
    };

    const subtitleChildren = (
        <>
            {isInStep([AddLogoStepEnum.ADD_TEAM_LOGO]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Think carefully - you can only add your team logo once!</div>
                    <div className="text-sm text-white/64 pt-0">Logos must:</div>
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
            {isInStep([AddLogoStepEnum.CONFIRM_LOGO]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Are you sure you've added the logo that you'll want forever?</div>
                    <div className="text-sm text-white/64 -mt-1 pt-0">Think carefully - you can only add the team logo once!</div>
                </>
            )}
            {isInStep([AddLogoStepEnum.EDIT_LOGO_PENDING]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">
                        Thank you for submitting a logo for your team. All logos go through an approval process, and you’ll receive email notification
                        when this logo is accepted or rejected. You can cancel the pending request until it’s approved.
                    </div>
                </>
            )}
            {isInStep([AddLogoStepEnum.CANCEL_PENDING_REQUEST]) && (
                <>
                    <div className="text-sm text-white/64 pt-0">Are you sure you want to cancel the pending logo request?</div>
                </>
            )}
        </>
    );

    const bodyChildren = (
        <>
            {isInStep([AddLogoStepEnum.ADD_TEAM_LOGO]) && (
                <div className="flex flex-col items-start justify-start w-full gap-1">
                    <div className="logo w-full">
                        <label className="inline-block text-sm text-white font-semibold">Team Logo</label>
                        <span className="text-sm text-assist-green">*</span>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col w-full h-full border-2 border-blue-200 border-dashed hover:border-gray-300 rounded-md">
                                <div className="flex flex-col items-center justify-center pt-7">
                                    {fileDataURL ? (
                                        <p className="img-preview-wrapper">{<img src={fileDataURL} className="w-20" alt="preview" />}</p>
                                    ) : null}
                                    {!fileDataURL && (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                            <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">Attach Image</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" accept=".png, .jpg, .jpeg" onChange={changeLogoHandler} className="opacity-0" />
                            </label>
                        </div>
                    </div>
                </div>
            )}
            {isInStep([AddLogoStepEnum.CONFIRM_LOGO]) && (
                <div className="flex flex-row items-center w-full justify-start gap-5">
                    <div className="flex flex-col items-start justify-start gap-1">
                        <span className="text-sm font-semibold text-white">Logo</span>
                        {fileDataURL ? <p className="img-preview-wrapper">{<img src={fileDataURL} className="w-20" alt="preview" />}</p> : null}
                    </div>
                </div>
            )}
            {isInStep([AddLogoStepEnum.EDIT_LOGO_PENDING, AddLogoStepEnum.CANCEL_PENDING_REQUEST]) && (
                <div className="flex flex-row items-center w-full justify-start gap-5">
                    <div className="flex flex-col items-start justify-start gap-1">
                        <span className="text-sm font-semibold text-white">Pending Approval</span>
                    </div>
                </div>
            )}
        </>
    );

    const footerChildren = (
        <>
            {isInStep([AddLogoStepEnum.ADD_TEAM_LOGO]) && (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button onClick={closeModal} className="subheading-two" colorTheme={ColorTheme.White}>
                        Close
                    </Button>
                    <button
                        onClick={changeStep}
                        className={classNames('btn-rounded-green px-8 subheading-two', {
                            'cursor-not-allowed opacity-10': !fileDataURL,
                        })}
                    >
                        Confirm
                    </button>
                </div>
            )}
            {isInStep([AddLogoStepEnum.CONFIRM_LOGO]) && (
                <div className="flex flex-row items-center justify-end w-full gap-2">
                    <Button
                        colorTheme={ColorTheme.White}
                        disabled={loadingRequest}
                        onClick={() => setStep(AddLogoStepEnum.ADD_TEAM_LOGO)}
                        className="subheading-two"
                    >
                        Edit Logo
                    </Button>
                    <button onClick={handleSubmit} className="btn-rounded-green px-8 subheading-two">
                        <span className={loadingRequest ? 'cursor-not-allowed opacity-10 text-black' : 'text-black'}>
                            {loadingRequest ? 'Loading...' : 'Confirm Logo'}
                        </span>
                    </button>
                </div>
            )}
            {isInStep([AddLogoStepEnum.EDIT_LOGO_PENDING]) && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                    <button
                        onClick={() => setStep(AddLogoStepEnum.CANCEL_PENDING_REQUEST)}
                        className="subheading-two h-[48px] px-8 text-white flex flex-col items-center justify-center border-2 border-white rounded-lg"
                    >
                        Cancel Request
                    </button>
                    <Button onClick={() => closeModal(true)} className="subheading-two" colorTheme={ColorTheme.White}>
                        Close
                    </Button>
                </div>
            )}
            {isInStep([AddLogoStepEnum.CANCEL_PENDING_REQUEST]) && (
                <div className="flex flex-row items-center justify-end gap-2">
                    <Button onClick={() => setStep(AddLogoStepEnum.EDIT_LOGO_PENDING)} className="subheading-two" colorTheme={ColorTheme.White}>
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
            setOpen={() => closeModal()}
        />
    );
};
