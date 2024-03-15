export const TutorialProgress = ({ currentStep }) => {
    // Define steps
    const steps = ['Intro', 'Lineup', 'Game', 'Finish'];

    return (
        <div className="bg-indigo-600 relative z-[999999]">
            <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8 flex justify-center">
                <ol className="flex items-center w-full text-xs sm:text-sm md:text-base text-center sm:subheading-one justify-center">
                    {steps.map((step, index) => (
                        <li
                            className={`flex md:w-full items-center ${currentStep >= index ? 'text-white' : 'text-gray-400'} ${
                                index !== steps.length - 1
                                    ? "sm:after:content-[''] after:w-full after:h-[0.5] after:border-b after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
                                    : ''
                            } ${currentStep > index ? 'after:border-white' : 'after:border-gray-400'}`}
                        >
                            <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 font-bold">
                                {currentStep > index && (
                                    <svg
                                        className="hidden sm:block w-4 h-4 mr-2.5 text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                                    </svg>
                                )}
                                {step}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};
