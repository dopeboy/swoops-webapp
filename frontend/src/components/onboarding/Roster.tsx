import { ReactElement } from 'react';
import Step from 'src/components/onboarding/Step';

const Roster = (): ReactElement => {
    const steps = [
        {
            title: 'Build your Team',
            summary: 'Every athlete in the Swoops league is a unique NFT that improves over time. Build your team on Opensea.',
            button: 'Browse Athletes on Opensea',
            buttonWidth: 371,
            active: true,
        },
        {
            title: 'Add your Email Address',
            summary: 'We’ll notify you by email when your tournaments are beginning and when you win money.',
            button: 'Add Email Address',
            buttonWidth: 273,
            active: false,
        },
        {
            title: 'Join Games and Tournaments',
            summary: 'Help your athletes progress and make money by joining head to head games and prize money tournaments.',
            button: 'Browse The Court',
            buttonWidth: 260,
            active: false,
        },
    ];

    return (
        <div className="flex flex-col bg-black">
            <div className="container-md ">
                <div className="relative">
                    <div className="py-14">
                        {steps.map((step, idx) => (
                            <Step
                                key={idx}
                                step={idx + 1}
                                summary={step.summary}
                                title={step.title}
                                button={step.button}
                                active={step.active}
                                isLast={idx === steps.length - 1}
                            />
                        ))}
                    </div>
                    <div className="w-px h-full bg-white/16 absolute top-0 left-7 sm:left-14" />
                </div>
            </div>
        </div>
    );
};

export default Roster;
