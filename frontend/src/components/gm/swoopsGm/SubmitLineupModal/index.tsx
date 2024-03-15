import React, { ReactElement, useState } from 'react';
import Modal from 'react-modal';
import { useRouter } from 'next/router';
import { NBAPlayerStats } from 'src/lib/gm/api/models/Player';
import { ApiService } from 'src/lib/gm/api/services/ApiService';
import { XMarkIcon } from '@heroicons/react/24/solid';
// import { ExclamationCircleIcon } from '@heroicons/react/outline';
import TwitterIcon from 'src/components/gm/swoopsGm/TwitterIcon';
import EmailIcon from 'src/components/gm/swoopsGm/EmailIcon';
import OtpInput from 'react-otp-input';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useFormik, FormikProps } from 'formik';
import * as yup from 'yup';
import 'yup-phone';

const useSendVerificationCode = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const request = async (userId: string, verificationCode: string): Promise<void> => {
        if (isLoading) {
            return;
        }

        try {
            setIsLoading(true);
            const data = await ApiService.apiConfirmVerificationCode(userId, verificationCode);
            setData(data);
            setError(null);
        } catch (err) {
            setData(null);
            setError(err);
            if (err?.body?.detail) {
                toast.error(err.body.detail);
            }
        } finally {
            setIsLoading(false);
        }
    };
    return {
        request,
        isLoading,
        error,
        setError,
        data,
    };
};
const useRequestVerificationCode = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ id: '' });

    const request = async (phoneNumber: string, twitterHandle: string, email: string): Promise<void> => {
        if (isLoading) {
            return;
        }

        try {
            setIsLoading(true);
            const data = await ApiService.apiRequestVerificationCode(phoneNumber, twitterHandle, email);
            setData(data);
            setError(null);
        } catch (err) {
            setData({ id: '' });
            setError(err);
            if (err?.body) {
                toast.error(Object.values(Object.values(err.body)[0])[0]);
            }
        } finally {
            setIsLoading(false);
        }
    };
    return {
        request,
        isLoading,
        error,
        data,
    };
};

interface PhoneTwitterAndEmailInputIProps {
    setOpen: (open) => void;
    formik: FormikProps<IForm>;
    disabled?: boolean;
    handleSubmit: () => void;
}

const PhoneTwitterAndEmailInput = ({ setOpen, formik, disabled, handleSubmit }: PhoneTwitterAndEmailInputIProps): ReactElement => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between py-6 px-6 border-b border-solid border-white/8 w-full">
                <div>
                    <h2 className="heading-three text-white uppercase">
                        Opt-in for SMS
                        <br className="md:hidden block" /> notifications
                    </h2>
                    <p className="font-medium text-white/64 text-[12px]">
                        Get notified instantly when you win or lose, right on your phone.
                        <br />
                        Enter your phone number below to get started.
                    </p>
                </div>
                <XMarkIcon
                    className="cursor-pointer text-white w-6 h-6"
                    onClick={() => {
                        setOpen(false);
                    }}
                />
            </div>

            <div className="relative py-6 px-6 flex-auto space-y-6">
                <div>
                    <div className="flex justify-between">
                        <label htmlFor="twitterHandle" className="block text-base font-medium text-white mb-2">
                            Phone number
                        </label>
                        <p className="text-white/32 text-base leading-6 font-display font-bold">Optional</p>
                    </div>
                    <div className="relative flex w-full gap-4">
                        <input
                            id="countryCode"
                            value={formik.values['countryCode']}
                            autoComplete="off"
                            onChange={formik.handleChange}
                            className="px-3 h-12 bg-white/4 rounded-lg text-white placeholder:text-white/32 text-base font-display font-bold appearance-none focus:outline placeholder:text-white/32 focus:text-white text-white w-16"
                            placeholder="+1"
                        />
                        <input
                            id="phoneNumber"
                            value={formik.values['phoneNumber']}
                            autoComplete="off"
                            onChange={formik.handleChange}
                            className="px-3 h-12 bg-white/4 grow rounded-lg text-white placeholder:text-white/32 text-base font-display font-bold appearance-none focus:outline placeholder:text-white/32 focus:text-white text-white"
                            placeholder="2223334444"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between">
                        <label htmlFor="twitterHandle" className="block text-base font-medium text-white mb-2">
                            Twitter Handle
                        </label>
                        <p className="text-white/32 text-base leading-6 font-display font-bold">Optional</p>
                    </div>

                    <div className="relative flex w-full grow">
                        <span className="pl-4 pr-1 bg-white/4 rounded-l-lg flex items-center py-1.5 leading-6 text-base font-normal text-center whitespace-nowrap focus:border-none">
                            <TwitterIcon />
                        </span>
                        <input
                            id="twitterHandle"
                            value={formik.values['twitterHandle']}
                            autoComplete="off"
                            onChange={formik.handleChange}
                            className="px-3 h-12 bg-white/4 rounded-r-lg rounded-l-none text-white placeholder:text-white/32 text-base font-display font-bold grow  appearance-none  focus:outline placeholder:text-white/32 focus:text-white text-white"
                            placeholder="@PlaySwoopsGM"
                        />
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center justify-end px-6 py-5 border-t border-solid  border-white/8 gap-y-6">
                <button className="btn-rounded-white bg-white mr-2 w-fit" onClick={() => setOpen(false)}>
                    Cancel
                </button>

                {/* TODO - Shouldn't have to set disabled class like this */}
                <button
                    className={disabled ? 'btn-rounded-grey' : 'btn-rounded-green'}
                    onClick={() => {
                        handleSubmit();
                    }}
                    disabled={disabled}
                >
                    Send Verification Code
                </button>
            </div>
        </div>
    );
};

interface VerifyCodeInputIProps {
    setOpen: (open: boolean) => void;
    formik: FormikProps<IForm>;
    userId: string;
    disabled?: boolean;
    handleSubmit: () => void;
}

const VerifyCodeInput = ({ setOpen, formik, userId, disabled, handleSubmit }: VerifyCodeInputIProps): ReactElement => {
    const [verificationCode, setVerificationCode] = useState('');
    const { error, setError, request: confirmVerificationCode, isLoading } = useSendVerificationCode();
    const disableSubmit = isLoading || verificationCode.length !== 6;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between py-6 px-6 border-b border-solid border-white/8 w-full">
                <div>
                    <h2 className="heading-three text-white uppercase">
                        Verify your
                        <br className="md:hidden block" /> phone number
                    </h2>
                    <p className="font-medium text-white/64 text-[12px]">
                        We'll send a verification code via SMS text to your phone.
                        <br />
                        Once verified, your lineup will be submitted.
                    </p>
                </div>
                <XMarkIcon
                    className="cursor-pointer text-white w-6 h-6"
                    onClick={() => {
                        setOpen(false);
                    }}
                />
            </div>
            <div className="relative py-6 px-6 flex-auto space-y-8">
                <div>
                    <h2 className="text-[12px] leading-6 font-medium font-header text-white uppercase mb-1">
                        Check your phone {formik.values['twitterHandle'] ? `, ${formik.values['twitterHandle']}` : ''}
                    </h2>
                    <p className="text-base text-white">
                        We sent a verification code to {formik.values['countryCode'] + formik.values['phoneNumber']}. It expires in 10 minutes.
                    </p>
                </div>
                <div>
                    <OtpInput
                        containerStyle="flex flex-row justify-between mb-5"
                        inputStyle="px-0 border border-solid border-transparent bg-white/4 rounded-lg text-white !w-[48px] sm:!w-[66px] h-[72px] heading-one"
                        // focusStyle="!bg-white/4 !text-white"
                        // errorStyle="text-defeat bg-defeat-red/8 border-defeat-red"
                        onChange={(otp) => {
                            if (!isEmpty(error)) {
                                setError(null);
                            }
                            setVerificationCode(otp);
                        }}
                        value={verificationCode}
                        numInputs={6}
                        renderInput={(props) => <input {...props} />}
                        // hasErrored={!isEmpty(error)}
                    />
                    {error && (
                        <div className="flex items-center mt-1.5">
                            {/* <ExclamationCircleIcon className="w-6 h-6 text-defeat" /> */}
                            <p className="ml-2 text-defeat text-base leading-6 font-bold font-display">Please enter the correct verification code.</p>
                        </div>
                    )}
                </div>
                <div>
                    <button
                        className={classNames('btn-rounded-grey-inverse mr-2 w-full sm:w-fit mt-8 sm:mt-0', {
                            'text-white': !disabled,
                            'text-off-black': disabled,
                        })}
                        onClick={() => {
                            handleSubmit();
                        }}
                        disabled={disabled}
                    >
                        Send another code
                    </button>
                </div>
            </div>
            <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center justify-end px-6 py-5 border-t border-solid  border-white/8 gap-y-6">
                <button className="btn-rounded-white bg-white mr-2 w-fit" onClick={() => setOpen(false)}>
                    Cancel
                </button>

                {/* TODO - Shouldn't have a conditional for className. Should just change when disabled automatically. */}
                <button
                    className={disableSubmit ? 'btn-rounded-grey' : 'btn-rounded-green'}
                    onClick={async () => {
                        setError(null);
                        try {
                            await confirmVerificationCode(userId, verificationCode);
                            setOpen(false);
                        } catch (err) {
                            console.error('failed to submit');
                            if (err?.body?.non_field_errors) {
                                toast.error(err.body.non_field_errors[0]);
                            }
                        }
                    }}
                    disabled={disableSubmit}
                >
                    Verify & Submit Lineup
                </button>
            </div>
        </div>
    );
};

interface IProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface IForm {
    countryCode: string;
    phoneNumber: string;
    twitterHandle: string;
    email: string;
}

const SubmitLineupModal = ({ open, setOpen }: IProps): ReactElement => {
    const formik: FormikProps<IForm> = useFormik<IForm>({
        initialValues: {
            countryCode: '+1',
            phoneNumber: '',
            email: '',
            twitterHandle: '',
        },
        validationSchema: yup
            .object()
            .shape({
                countryCode: yup.string().matches(/^\+(\d{1}\-)?(\d{1,3})$/, 'Country code is not valid'),
                phoneNumber: yup
                    .string()
                    .min(7, 'Phone number minimum 7 digits')
                    .matches(
                        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
                        'Phone number is not valid'
                    ),
                twitterHandle: yup.string().test('is twitterHandle valid', 'Twitter is not valid', (twitterHandle) => {
                    const twitterRegex = new RegExp(/(^|[^@\w])@(\w{1,15})\b/);

                    return twitterRegex.test(twitterHandle) || isEmpty(twitterHandle);
                }),
            })
            .optional(),
        onSubmit: (values) => {
            request(`${values.countryCode}${values.phoneNumber}`, values.twitterHandle, values.email);
        },
    });

    const { request, data, isLoading } = useRequestVerificationCode();
    const userId = data.id;

    const handleSubmit = () => {
        if (isEmpty(formik.errors)) {
            formik.handleSubmit();
            return;
        }
        toast.error(Object.values(formik.errors)[0]);
    };

    return (
        <Modal
            isOpen={open}
            className="absolute h-screen sm:h-auto rounded-none top-1/2 left-1/2 -mr-[50%] w-full max-w-[680px] bg-black border border-solid border-black p-0 sm:rounded-lg right-auto bottom-auto transform-translate-50-50"
            bodyOpenClassName="overflow-y-hidden md:overflow-y-auto"
            onRequestClose={() => {
                setOpen(false);
            }}
        >
            {userId ? (
                <VerifyCodeInput setOpen={setOpen} formik={formik} userId={userId} disabled={isLoading} handleSubmit={handleSubmit} />
            ) : (
                <PhoneTwitterAndEmailInput setOpen={setOpen} formik={formik} disabled={isLoading} handleSubmit={handleSubmit} />
            )}
        </Modal>
    );
};

export default SubmitLineupModal;
