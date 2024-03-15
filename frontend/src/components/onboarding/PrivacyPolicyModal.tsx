import { Dialog } from '@headlessui/react';
import { ModalWrapper } from '../common/ModalWrapper';

interface TermsOfServiceModalProps {
    open: boolean;
    setOpen: (openValue: boolean) => void;
}
export const PrivacyPolicyModal: React.FC<TermsOfServiceModalProps> = ({ open, setOpen }) => {
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full max-h-[700px]">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="subheading-one text-white px-3 pb-2 pt-3">Privacy Policy</div>
                    <div className="text-base text-white px-3 py-3 max-h-[500px] overflow-scroll">
                        PrivacyPoEffective as of 6 December 2022. This Privacy Policy describes how MetaBall Inc.("MetaBall," "Swoops," "we", “us,” or
                        "our") processes personal information that we collect through our digital or online properties or services that link to this
                        Privacy Policy (including as applicable, our website, social media pages, marketing activities, live events and other
                        activities described in this Privacy Policy (collectively, the “Service”)). Index
                        .............................................................................Personal information we collect
                        ................................................................................................5 Information you provide to
                        us. Personal information you may provide to us through the Service or otherwise
                        includes:.............................................................5 Third-party sources. We may combine personal
                        information we receive from you with personal information we obtain from other sources, such as:.........................5
                        Public sources, such as government agencies, public records, social media platforms, public blockchains and ledgers, and other
                        publicly available sources.. .6 Marketing partners, such as joint marketing partners and event co-sponsors........6
                        Third-party services, such as virtual currency account services you link to the Services. This data may include your username,
                        profile picture, wallet address, and other information associated with your account on that third-party service that is made
                        available to us based on your account settings on that service.........6 Our affiliate partners, such as our affiliate network
                        provider and publishers, influencers, and promoters who participate in our paid affiliate programs.............6 Automatic
                        data collection. We, our service providers, and our business partners may automatically log information about you, your
                        computer or mobile device, and your interaction over time with the Service, our communications and other online services, such
                        as:.........................................................................................6 Cookies and similar
                        technologies. Some of the automatic collection described above is facilitated by the following
                        technologies:..................................................6
                        .............................................................How we use your personal information
                        ................................................................................................7 Service delivery and
                        operations. We may use your personal information to:.........7 Research and development. We may use your personal information
                        for research and development purposes, including to analyze and improve the Service and our business and to develop new
                        products and services..............................................7 Marketing and advertising. We, our service providers and
                        our third-party advertising partners may collect and use your personal information for marketing and advertising
                        purposes:.......................................................................................7 Direct marketing. We may
                        send you direct marketing communications and may personalize these messages based on your needs and interests. You may opt-out
                        of our marketing communications as described in the Opt-out of marketing section
                        below.......................................................................................................... 8
                        Interest-based advertising. Our third-party advertising partners may use cookies and similar technologies to collect
                        information about your interaction (including the data described in the automatic data collection section above) with the
                        Service, our communications and other online services over time, and use that information to serve online ads that they think
                        will interest you. This is called interest-based advertising. We may also share information about our users with these
                        companies to facilitate interest-based advertising to those or similar users on other online platforms. You can learn more
                        about your choices for limiting interest-based advertising in the Your choices
                        section...........................................8 Events, promotions, and contests. We may use your personal information
                        to:.......8 Service improvement and analytics. We may use your personal information to analyze your usage of the Service,
                        improve the Service, improve the rest of our business, help us understand user activity on the Service, including which pages
                        are most and least visited and how visitors move around the Service, as well as user interactions with our emails, and to
                        develop new products and services.......8 Compliance and protection. We may use your personal information
                        to:.................8 With your consent. In some cases, we may specifically ask for your consent to collect, use or share your
                        personal information, such as when required by law.....8 To create aggregated, de-identified and/or anonymized data. We may
                        create aggregated, de-identified and/or anonymized data from your personal information and other individuals whose personal
                        information we collect. We make personal information into de-identified and/or anonymized data by removing information that
                        makes the data identifiable to you. We may use this aggregated, de- identified and/or anonymized data and share it with third
                        parties for our lawful business purposes, including to analyze and improve the Service and promote our
                        business.................................................................................................................. 8
                        Cookies and similar technologies. In addition to the other uses included in this section, we may use the Cookies and similar
                        technologies described above for the following
                        purposes:................................................................................................. 9
                        ........................................................How we share your personal information
                        ................................................................................................9
                        ........................................................................................................................Your
                        choices ..............................................................................................10 Access or update your
                        information. If you have registered for an account with us through the Service, you may review and update certain account
                        information by logging into the
                        account.......................................................................................10 Opt-out of communications.
                        You may opt-out of marketing-related emails by following the opt-out or unsubscribe instructions at the bottom of the email,
                        or by contacting us. Please note that if you choose to opt-out of marketing-related emails, you may continue to receive
                        service-related and other non-marketing
                        emails................................................................................................................... 10
                        If you receive text messages from us, you may opt out of receiving further text messages from us by replying STOP to our
                        message. You may also text STOP to +1-786-461-1676 /
                        5W00PS..................................................................................10 Blocking images/clear gifs:
                        browsers and devices allow you to configure your device to prevent images from loading. To do this, follow the instructions in
                        instructions in your particular browser or device
                        settings....................................................................11 Advertising choices. You may be able to limit
                        use of your information for interest- based advertising through the following
                        settings/options/tools:...........................11 Browser settings. Changing your internet web browser settings to block
                        third- party cookies.........................................................................................................
                        11 Privacy browsers/plug-ins. Using privacy browsers and/or ad-blocking browser plug-ins that let you block tracking
                        technologies..................................................11 Platform settings. Google and Facebook offer opt-out features
                        that let you opt-out of use of your information for interest-based advertising. You may be able to exercise that option at the
                        following websites:.....................................................11 Google:
                        https://adssettings.google.com................................................................11 Facebook:
                        https://www.facebook.com/about/ads..................................................11 Ad industry tools. Opting out of
                        interest-based ads from companies that participate in the following industry opt-out
                        programs:........................................11 Network Advertising Initiative:
                        http://www.networkadvertising.org/managing/opt_out.asp...................................11 Digital Advertising Alliance:
                        optout.aboutads.info.................................................11 AppChoices mobile app, available at
                        https://www.youradchoices.com/appchoices, which will allow you to opt-out of interest-based ads in mobile apps served by
                        participating members of the Digital Advertising Alliance....................................11 Mobile settings. Using your
                        mobile device settings to limit use of the advertising ID associated with your mobile device for interest-based advertising
                        purposes...11 Do Not Track. Some Internet browsers may be configured to send “Do Not Track” signals to the online services
                        that you visit. We currently do not respond to “Do Not Track” or similar signals. To find out more about “Do Not Track,”
                        please visit http://www.allaboutdnt.com..................................................................................11
                        Declining to provide information. We need to collect personal information to provide certain services. If you do not provide
                        the information we identify as required or mandatory, we may not be able to provide those services................11 Linked
                        third-party platforms. If you choose to connect to the Service through your social media account or other third-party
                        platform, you may be able to use your settings in your account with that platform to limit the information we receive from it.
                        If you revoke our ability to access information from a third-party platform, that choice will not apply to information that we
                        have already received from that third
                        party............................................................................................................. 12
                        ..............................................................................................Other sites and services
                        ..............................................................................................12 ....The Service may contain
                        links to websites, mobile applications, and other online services operated by third parties. In addition, our content may be
                        integrated into web pages or other online services that are not associated with us. These links and integrations are not an
                        endorsement of, or representation that -3- we are affiliated with, any third party. We do not control websites, mobile
                        applications or online services operated by third parties, and we are not responsible for their actions. We encourage you to
                        read the privacy policies of the other websites, mobile applications and online services you use........................12
                        ..................................................................................................................................Security
                        ..............................................................................................12 ......We employ a number of
                        technical, organizational and physical safeguards designed to protect the personal information we collect. However, security
                        risk is inherent in all internet and information technologies, and we cannot guarantee the security of your personal
                        information....................................................12
                        ........................................................................................International data transfer
                        ..............................................................................................12 ..We are headquartered in
                        the United States and may use service providers that operate in other countries. Your personal information may be transferred
                        to the United States or other locations where privacy laws may not be as protective as those in your state, province, or
                        country...............................................12
                        .................................................................................................................................Children
                        ..............................................................................................12 ..The Service is not
                        intended for use by anyone under 18 years of age. If you are a parent or guardian of a child from whom you believe we have
                        collected personal information in a manner prohibited by law, please contact us. If we learn that we have collected personal
                        information through the Service from a child without the consent of the child’s parent or guardian as required by law, we will
                        comply with applicable legal requirements to delete the
                        information.............................................................12
                        ................................................................................Changes to this Privacy Policy
                        ..............................................................................................12 .We reserve the right to
                        modify this Privacy Policy at any time. If we make material changes to this Privacy Policy, we will notify you by updating the
                        date of this Privacy Policy and posting it on the Service or other appropriate means. Any modifications to this Privacy Policy
                        will be effective upon our posting the modified version (or as otherwise indicated at the time of posting). In all cases, your
                        use of the Service after the effective date of any modified Privacy Policy indicates your acknowledging that the modified
                        Privacy Policy applies to your interactions with the Service and our
                        business.........................................................12
                        ............................................................................................................How to contact us
                        ..............................................................................................13 -4- Personal information we
                        collectInformation you provide to us. Personal information you may provide to us through the Service or otherwise includes:
                        Contact data, such as your first and last name, email address, phone number, and Twitter handle. Profile data, such as the
                        username and password that you may set to establish an online account on the Service, date of birth, biographical details,
                        links to your profiles on social networks, preferences, information about your participation in our contests, promotions, or
                        surveys, and any other information that you add to your account profile. Transactional data, such as blockchain transaction
                        history and other information associated with your linked cryptocurrency wallet, as well as information needed to mint a
                        nonfungible token (“NFT”) on or through the Services. Payment data needed to complete transactions, including payment card
                        information and bank account number. User-generated content data, such as photos, images, music, videos, comments, questions,
                        messages, works of authorship, team names, team logos, team rosters, player names, and other content or information that you
                        generate, transmit, or otherwise make available on the Service, as well as associated metadata. Metadata includes information
                        on how, when, where and by whom a piece of content was collected and how that content has been formatted or edited. Metadata
                        also includes information that users can add or can have added to their content, such as keywords, geographical or location
                        information, and other similar data. Promotion data, including information you share when you enter a competition, promotion
                        or complete a survey. Please note that if you participate in a sweepstakes, contest or giveaway through the Service, we may
                        ask you for your Contact Data to notify you if you win or not, to verify your identity, determine your eligibility, and/or to
                        send you prizes. In some situations, we may need additional information as a part of the entry process, such as a prize
                        selection choice. These sweepstakes and contests are voluntary. We recommend that you read the rules and other relevant
                        information for each sweepstakes and contest that you enter. Government-issued identification number data, such as national
                        identification number (e.g., Social Security Number, tax identification number, passport number), state or local
                        identification number (e.g., driver’s license or state ID number), and an image of the relevant identification card.
                        Communications data based on our exchanges with you, including when you contact us through the Service, social media, or
                        otherwise. Marketing data, such as your preferences for receiving our marketing communications and details about your
                        engagement with them. Other data not specifically listed here, which we will use as described in this Privacy Policy or as
                        otherwise disclosed at the time of collection. Third-party sources. We may combine personal information we receive from you
                        -5- with personal information we obtain from other sources, such as: Public sources, such as government agencies, public
                        records, social media platforms, public blockchains and ledgers, and other publicly available sources. Private sources, such
                        as data providers, social media platforms and data licensors. Marketing partners, such as joint marketing partners and event
                        co- sponsors. Third-party services, such as virtual currency account services you link to the Services. This data may include
                        your username, profile picture, wallet address, and other information associated with your account on that third- party
                        service that is made available to us based on your account settings on that service. Our affiliate partners, such as our
                        affiliate network provider and publishers, influencers, and promoters who participate in our paid affiliate programs.
                        Automatic data collection. We, our service providers, and our business partners may automatically log information about you,
                        your computer or mobile device, and your interaction over time with the Service, our communications and other online services,
                        such as: Device data, such as your computer or mobile device’s operating system type and version, manufacturer and model,
                        browser type, screen resolution, RAM and disk size, CPU usage, device type (e.g., phone, tablet), IP address, unique
                        identifiers (including identifiers used for advertising purposes), language settings, mobile device carrier, radio/network
                        information (e.g., Wi- Fi, LTE, 3G), and general location information such as city, state or geographic area. Online activity
                        data, such as pages or screens you viewed, how long you spent on a page or screen, the website you visited before browsing to
                        the Service, navigation paths between pages or screens, information about your activity on a page or screen, access times and
                        duration of access, and whether you have opened our emails or clicked links within them. Communication interaction data such
                        as your interactions with our email, text or other communications (e.g., whether you open and/or forward emails) – we may do
                        this through use of pixel tags (which are also known as clear GIFs), which may be embedded invisibly in our emails. Cookies
                        and similar technologies. Some of the automatic collection described above is facilitated by the following technologies:
                        Cookies, which are small text files that websites store on user devices and that allow web servers to record users’ web
                        browsing activities and remember their submissions, preferences, and login status as they navigate a site. Cookies used on our
                        sites include both “session cookies” that are deleted when a session ends, “persistent cookies” that remain longer, “first -6-
                        party” cookies that we place and “third party” cookies that our third-party business partners and service providers place.
                        Local storage technologies, like HTML5, that provide cookie-equivalent functionality but can store larger amounts of data on
                        your device outside of your browser in connection with specific applications. Web beacons, also known as pixel tags or clear
                        GIFs, which are used to demonstrate that a webpage or email was accessed or opened, or that certain content was viewed or
                        clicked. How we use your personal information We may use your personal information for the following purposes or as otherwise
                        described at the time of collection: Service delivery and operations. We may use your personal information to: provide,
                        operate and improve the Service and our business, including without limitation creating teams and drafting players;
                        personalizing the service, including remembering the devices from which you have previously logged in and remembering your
                        selections and preferences as you navigate the Service; establish and maintain your user profile on the Service; facilitate
                        your invitations to friends who you want to invite to join the Service; facilitate social features of the Service, such as by
                        identifying and suggesting connections with other users of the Service and providing chat or messaging functionality; enable
                        security features of the Service, such as by sending you security codes via email or SMS, and remembering devices from which
                        you have previously logged in; enable you to mint an NFT; communicate with you about the Service, including by sending
                        Service- related announcements, updates, security alerts, and support and administrative messages; communicate with you about
                        events or contests in which you participate; understand your needs and interests, and personalize your experience with the
                        Service and our communications; and provide support for the Service, and respond to your requests, questions and feedback.
                        Research and development. We may use your personal information for research and development purposes, including to analyze and
                        improve the Service and our business and to develop new products and services. Marketing and advertising. We, our service
                        providers and our third-party advertising partners may collect and use your personal information for marketing and advertising
                        purposes: -7- Direct marketing. We may send you direct marketing communications and may personalize these messages based on
                        your needs and interests. You may opt-out of our marketing communications as described in the Opt-out of marketing section
                        below. Interest-based advertising. Our third-party advertising partners may use cookies and similar technologies to collect
                        information about your interaction (including the data described in the automatic data collection section above) with the
                        Service, our communications and other online services over time, and use that information to serve online ads that they think
                        will interest you. This is called interest-based advertising. We may also share information about our users with these
                        companies to facilitate interest-based advertising to those or similar users on other online platforms. You can learn more
                        about your choices for limiting interest-based advertising in the Your choices section. Events, promotions, and contests. We
                        may use your personal information to: administer promotions and contests; communicate with you about promotions or contests
                        in which you participate; and contact or market to you after collecting your personal information at an event Service
                        improvement and analytics. We may use your personal information to analyze your usage of the Service, improve the Service,
                        improve the rest of our business, help us understand user activity on the Service, including which pages are most and least
                        visited and how visitors move around the Service, as well as user interactions with our emails, and to develop new products
                        and services. Compliance and protection. We may use your personal information to: comply with applicable laws, lawful
                        requests, and legal process, such as to respond to subpoenas, investigations or requests from government authorities; protect
                        our, your or others’ rights, privacy, safety or property (including by making and defending legal claims); audit our internal
                        processes for compliance with legal and contractual requirements or our internal policies; enforce the terms and conditions
                        that govern the Service; and prevent, identify, investigate and deter fraudulent, harmful, unauthorized, unethical or illegal
                        activity, including cyberattacks and identity theft. With your consent. In some cases, we may specifically ask for your
                        consent to collect, use or share your personal information, such as when required by law. To create aggregated, de-identified
                        and/or anonymized data. We may create aggregated, de-identified and/or anonymized data from your personal information and
                        other individuals whose personal information we collect. We make personal information into de-identified and/or anonymized
                        data by removing information that makes the data identifiable to you. We may use this aggregated, de-identified and/or
                        anonymized data and share it with third parties for our lawful business -8- purposes, including to analyze and improve the
                        Service and promote our business. Cookies and similar technologies. In addition to the other uses included in this section, we
                        may use the Cookies and similar technologies described above for the following purposes: Technical operation. To allow the
                        technical operation of the Service, such as by remembering your selections and preferences as you navigate the site, and
                        whether you are logged in when you visit password protected areas of the Service. Functionality. To enhance the performance
                        and functionality of our services. Advertising. To help our third-party advertising partners collect information about how
                        you use the Service and other online services over time, which they use to show you ads on other online services they believe
                        will interest you and measure how the ads perform. Analytics. To help us understand user activity on the Service, including
                        which pages are most and least visited and how visitors move around the Service, as well as user interactions with our emails.
                        [For example, we use Google Analytics for this purpose. You can learn more about Google Analytics and how to prevent the use
                        of Google Analytics relating to your use of our sites here: https://tools.google.com/dlpage/gaoptout.] How we share your
                        personal information We may share your personal information with the following parties and as otherwise described in this
                        Privacy Policy, in other applicable notices, or at the time of collection. Affiliates. Our corporate parent, subsidiaries, and
                        affiliates. Service providers. Third parties that provide services on our behalf or help us operate the Service or our
                        business (such as hosting, information technology, customer support, email delivery, marketing, consumer research and website
                        analytics). Cryptocurrency platforms. Any information collected necessary for you to mint an NFT (such as your wallet address)
                        is collected and processed directly by your chosen cryptocurrency platform, such as [MetaMask. Please review the privacy
                        policies for the relevant cryptocurrency platform to learn how they may use your personal information. For example, MetaMask’s
                        privacy policy is available at https://consensys.net/privacy-policy.] Advertising partners. Third-party advertising companies
                        for the interest-based advertising purposes described above. Third parties designated by you. We may share your personal
                        information with third parties where you have instructed us or provided your consent to do so. For example, we may share your
                        personal information with third-party advertisers with whom we are collaborating to offer you additional services such as
                        sweepstakes, raffles, and promotions. We will share personal information that is needed for these other companies to provide
                        the services that you have requested. Business and marketing partners. Third parties with whom we co-sponsor -9- events or
                        promotions, with whom we jointly offer products or services, or whose products or services may be of interest to you. Linked
                        third-party services. If you log into the Service with, or otherwise link your Service account to, a social media or other
                        third-party service, we may share your personal information with that third-party service. The third party’s use of the shared
                        information will be governed by its privacy policy and the settings associated with your account with the third-party service.
                        Professional advisors. Professional advisors, such as lawyers, auditors, bankers and insurers, where necessary in the course
                        of the professional services that they render to us. Authorities and others. Law enforcement, government authorities, and
                        private parties, as we believe in good faith to be necessary or appropriate for the Compliance and protection purposes
                        described above. Business transferees. We may disclose personal information in the context of actual or prospective business
                        transactions (e.g., investments in Metaball, financing of Metaball, public stock offerings, or the sale, transfer or merger of
                        all or part of our business, assets or shares), for example, we may need to share certain personal information with
                        prospective counterparties and their advisers. We may also disclose your personal information to an acquirer, successor, or
                        assignee of Metaball as part of any merger, acquisition, sale of assets, or similar transaction, and/or in the event of an
                        insolvency, bankruptcy, or receivership in which personal information is transferred to one or more third parties as one of
                        our business assets. Other users and the public. Your profile and other user-generated content data (except for messages) are
                        visible to other users of the Service and the public. For example, other users of the Service or the public may have access to
                        your information if you chose to make your profile or other personal information, such as your team name and team roster,
                        available to them through the Service, such as when you share NFTs, compete against other users or share other content. This
                        information can be seen, collected and used by others, including being cached, copied, screen captured or stored elsewhere by
                        others (e.g., search engines), and we are not responsible for any such use of this information. Your choices Access or update
                        your information. If you have registered for an account with us through the Service, you may review and update certain account
                        information by logging into the account. Opt-out of communications. You may opt-out of marketing-related emails by following
                        the opt-out or unsubscribe instructions at the bottom of the email, or by contacting us. Please note that if you choose to
                        opt-out of marketing-related emails, you may continue to receive service-related and other non-marketing emails. If you
                        receive text messages from us, you may opt out of receiving further text messages from us by replying STOP to our message. You
                        may also text STOP to +1- 786-461-1676 / 5W00PS. Cookies. Most browsers let you remove or reject cookies. To do this, follow
                        the instructions in your browser settings. Many browsers accept cookies by default until you change your settings. Please note
                        that if you set your browser to disable -10- cookies, the Service may not work properly. For more information about cookies,
                        including how to see what cookies have been set on your browser and how to manage and delete them, visit
                        www.allaboutcookies.org . You can also configure your device to prevent images from loading to prevent web beacons from
                        functioning. Blocking images/clear gifs: Most browsers and devices allow you to configure your device to prevent images from
                        loading. To do this, follow the instructions in your particular browser or device settings. Advertising choices. You may be
                        able to limit use of your information for interest- based advertising through the following settings/options/tools: Browser
                        settings. Changing your internet web browser settings to block third-party cookies. Privacy browsers/plug-ins. Using privacy
                        browsers and/or ad-blocking browser plug-ins that let you block tracking technologies. Platform settings. Google and Facebook
                        offer opt-out features that let you opt-out of use of your information for interest-based advertising. You may be able to
                        exercise that option at the following websites: oGoogle: https://adssettings.google.com oFacebook:
                        https://www.facebook.com/about/ads Ad industry tools. Opting out of interest-based ads from companies that participate in the
                        following industry opt-out programs: oNetwork Advertising Initiative: http://www.networkadvertising.org/managing/opt_out.asp
                        oDigital Advertising Alliance: optout.aboutads.info. oAppChoices mobile app, available at
                        https://www.youradchoices.com/appchoices, which will allow you to opt-out of interest-based ads in mobile apps served by
                        participating members of the Digital Advertising Alliance. Mobile settings. Using your mobile device settings to limit use of
                        the advertising ID associated with your mobile device for interest-based advertising purposes. You will need to apply these
                        opt-out settings on each device and browser from which you wish to limit the use of your information for interest-based
                        advertising purposes. We cannot offer any assurances as to whether the companies we work with participate in the opt-out
                        programs described above. Do Not Track. Some Internet browsers may be configured to send “Do Not Track” signals to the online
                        services that you visit. We currently do not respond to “Do Not Track” or similar signals. To find out more about “Do Not
                        Track,” please visit http://www.allaboutdnt.com. Declining to provide information. We need to collect personal information to
                        provide certain services. If you do not provide the information we identify as -11- required or mandatory, we may not be able
                        to provide those services. Linked third-party platforms. If you choose to connect to the Service through your social media
                        account or other third-party platform, you may be able to use your settings in your account with that platform to limit the
                        information we receive from it. If you revoke our ability to access information from a third-party platform, that choice will
                        not apply to information that we have already received from that third party. Delete your content or close your account. You
                        can choose to delete certain content through your account. If you wish to request to close your account, please contact us .
                        Other sites and services The Service may contain links to websites, mobile applications, and other online services operated by
                        third parties. In addition, our content may be integrated into web pages or other online services that are not associated with
                        us. These links and integrations are not an endorsement of, or representation that we are affiliated with, any third party. We
                        do not control websites, mobile applications or online services operated by third parties, and we are not responsible for
                        their actions. We encourage you to read the privacy policies of the other websites, mobile applications and online services
                        you use. Security We employ a number of technical, organizational and physical safeguards designed to protect the personal
                        information we collect. However, security risk is inherent in all internet and information technologies, and we cannot
                        guarantee the security of your personal information. International data transfer We are headquartered in the United States and
                        may use service providers that operate in other countries. Your personal information may be transferred to the United States
                        or other locations where privacy laws may not be as protective as those in your state, province, or country. Children The
                        Service is not intended for use by anyone under 18 years of age. If you are a parent or guardian of a child from whom you
                        believe we have collected personal information in a manner prohibited by law, please contact us. If we learn that we have
                        collected personal information through the Service from a child without the consent of the child’s parent or guardian as
                        required by law, we will comply with applicable legal requirements to delete the information. Changes to this Privacy Policy
                        We reserve the right to modify this Privacy Policy at any time. If we make material changes to this Privacy Policy, we will
                        notify you by updating the date of this Privacy Policy and posting it on the Service or other appropriate means. Any
                        modifications to this Privacy Policy will be effective upon our posting the modified version (or as otherwise indicated at the
                        time of posting). In all cases, your use of the Service after the effective date of any modified Privacy Policy indicates your
                        acknowledging that -12- the modified Privacy Policy applies to your interactions with the Service and our business. How to
                        contact us Email: hello@playswoops.com Mail: 2930 Domingo Ave #1314, Berkeley, CA 94705-2454licyModal
                    </div>
                    <div className="flex flex-row items-center justify-end py-3 px-3">
                        <button onClick={() => setOpen(false)} className="pt-1.5 pb-2 px-6 btn-rounded-white">
                            <span className="detail-one text-black">Close</span>
                        </button>
                    </div>
                </div>
            </Dialog.Panel>
        </ModalWrapper>
    );
};
