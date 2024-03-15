import { Dialog } from '@headlessui/react';
import { ModalWrapper } from '../common/ModalWrapper';

interface TermsOfServiceModalProps {
    open: boolean;
    setOpen: (openValue: boolean) => void;
}
export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ open, setOpen }) => {
    return (
        <ModalWrapper open={open}>
            <Dialog.Panel className="relative bg-black border-1 border-off-black overflow-y-show rounded-lg text-left shadow-lg shadow-black transform transition-all sm:my-8 sm:max-w-lg sm:w-full max-h-[700px]">
                <div className="flex flex-col divide-y-1 divide-off-black justify-start">
                    <div className="subheading-one text-white px-3 pb-2 pt-3">Terms of Service</div>
                    <div className="text-base text-white px-3 py-3 max-h-[500px] overflow-scroll">
                        Swoops Terms Of Service Last Updated: 6 December 2022 1. INTRODUCTION This Terms of Service Agreement (these “Terms”) govern
                        your access to and use of certain products, services and properties made available by MetaBall Inc. (“MetaBall,” “Swoops,”
                        “we,” “us,” or “our”), including the website, available at https://www.playswoops.com, and the web app enabled thereby
                        (collectively the “Website”); Swoops’ proprietary platform that enables users to mint and purchase non-fungible tokens
                        (“Tokens”) for use in the proprietary basketball strategy games enabled through the Website (each, a “Game”); and any software
                        and services provided on or in connection therewith (collectively with the Website, Game and Tokens, the “Service”). As used
                        herein, the terms “you,” and “your” refer to each individual who enters into these Terms on such individual’s own behalf, and
                        any entity on behalf of which an individual enters into these Terms. Certain features of the Service may be subject to
                        additional guidelines, terms, or rules (“Supplemental Terms”), which will be displayed in connection with such features. All
                        such Supplemental Terms are incorporated by reference into these Terms. If these Terms are inconsistent with any Supplemental
                        Terms, the Supplemental Terms shall control solely with respect to such services. THESE TERMS OF USE ARE IMPORTANT AND AFFECT
                        YOUR LEGAL RIGHTS, SO PLEASE READ THEM CAREFULLY. BY BROWSING THE WEBSITE, CONNECTING A DIGITAL WALLET TO THE SERVICE,
                        PURCHASING ANY TOKENS, AND/OR OTHERWISE USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS AND ALL OF THE TERMS
                        INCORPORATED HEREIN BY REFERENCE. IF YOU DO NOT AGREE TO THESE TERMS, YOU MAY NOT ACCESS OR USE THE SERVICE. YOU BEAR FULL
                        RESPONSIBILITY FOR VERIFYING THE IDENTITY, LEGITIMACY, AND AUTHENTICITY OF ANY TOKENS YOU PURCHASE. PLEASE BE AWARE THAT
                        SECTION 19 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE DISPUTES BETWEEN YOU AND SWOOPS. AMONG OTHER THINGS, SECTION 19
                        INCLUDES AN AGREEMENT TO ARBITRATE WHICH REQUIRES, WITH LIMITED EXCEPTIONS, THAT ALL DISPUTES BETWEEN YOU AND US SHALL BE
                        RESOLVED BY BINDING AND FINAL ARBITRATION. SECTION 19 ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION
                        19 CAREFULLY. UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN 30 DAYS: (1) YOU WILL ONLY BE PERMITTED TO PURSUE
                        DISPUTES OR CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR
                        REPRESENTATIVE ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE
                        ARBITRATION; AND (2) 275222257 v1 YOU ARE WAIVING YOUR RIGHT TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF IN A COURT OF LAW
                        AND TO HAVE A JURY TRIAL. PLEASE BE AWARE THAT SECTION 3.c OF THESE TERMS, BELOW, CONTAINS YOUR OPT-IN CONSENT TO RECEIVE
                        COMMUNICATIONS FROM US, INCLUDING EMAIL COMMUNICATION. Please refer to our Privacy Policy for information about how we
                        collect, use and share personal information about you. By submitting data through the Service, you expressly consent to the
                        collection, use and disclosure of your personal data in accordance with the Privacy Policy. Swoops reserves the right to
                        change or modify these Terms at any time and in our sole discretion. If we make changes to these Terms, we will provide notice
                        of such changes, such as by sending an email notification, providing notice through the Service or updating the “Last Updated”
                        date at the beginning of these Terms. By continuing to access or use the Service at any point after such update, you confirm
                        your acceptance of the revised Terms and all of the terms incorporated therein by reference. We encourage you to review these
                        Terms frequently to ensure that you understand the terms and conditions that apply when you access or use the Service. If you
                        do not agree to the revised Terms, you may not access or use the Service. 2. OUR SERVICE a.Description of Service . Swoops has
                        developed, and hosts, operates, and supports, an online platform through which users can view, offer to purchase and purchase
                        Tokens that feature unique characters developed by Swoops (each such character, a “Player”). Each Player has a unique
                        collection of skills and attributes that, like IRL athletes, develop and evolve in unpredictable ways over time. b.Minting a
                        Token . You can use the Service to mint one or more Tokens. Swoops may set limits on or other terms regarding the sale of
                        Tokens, including, without limitation, any fee payable to Swoops in connection with any subsequent sale of a Token after the
                        initial mint of such Token (the “Secondary Sale Fee”), and Swoops will display such terms at point of sale or otherwise within
                        the Service (the “NFT Terms”). Swoops does not guarantee that Tokens will be transferable to any other platform. Swoops is not
                        and shall not be a party to any transaction or dispute between any initial purchaser of a Token and any subsequent Owner of
                        such Token, whether arising from any rights granted in that Token or otherwise, unless otherwise set forth in connection with
                        such Token. c.Managing a Team . A user of the Service (“User”) can participate in one or more Games on the Service by
                        connecting a Digital Wallet (as defined below) to the Service and using Tokens that they Own to create teams of Players, which
                        such Players will be matched up against other Players in accordance with the then-current rules of the applicable Game. “Own”
                        means, with respect to a Token, a Token that you have rightfully and lawfully purchased or acquired from a legitimate source,
                        where proof of such purchase or acquisition is recorded on the relevant blockchain. 275222257 v1 d.Token Access Benefits . A
                        Token may enable its then-current Owner to access certain products, services and/or benefits furnished or made available in
                        connection therewith (“Token Access Benefits”), in each case as set forth under and subject to the then-current terms of such
                        Token and the Service, and as may be subject to change from time to time in Swoops’ sole discretion. e.Game Rules . Please
                        carefully read the instructions and other documentation provided in connection with each Game. The rules applicable to each
                        Game are subject to change in Swoops’ sole discretion. Please review the then- current rules of each Game regularly to ensure
                        you are familiar with the then- current terms applicable to your interaction with such Game. Swoops shall have no liability to
                        you in connection with your interaction with or participation in any Game. ● In connection with certain Games, you may be able
                        to unlock different rewards, and you may be able to “level up” Players, or receive enhanced versions of your existing Tokens.
                        ● Swoops may, in its sole discretion and with or without notice to you, remove one or more Games from the Service. ● Any
                        action that you take that results in a Token being sent to a null address, erased, or otherwise rendered permanently
                        inaccessible and/or unusable (“Burned”) is permanent and irreversible. You acknowledge and agree that Swoops shall not be
                        liable to you in connection with any Token that is Burned by you, whether or not as a result of or in connection with your use
                        of the Service. ● The skills and attributes of each Player (the “Player Attributes”) are subject to change from time to time.
                        Player Attributes are algorithmically generated, and except as otherwise expressly set forth on the Service, neither Swoops
                        nor any user can affect or impact the Player Attributes of any Player. You acknowledge and agree that the Player Attributes
                        associated with any Token that you Own may be subject to change from time to time, and Swoops will have no liability to you in
                        connection with the same. f.Interactions with Other Users . You are solely responsible for your interactions with other users
                        and any other parties with whom you interact; provided, however, that we reserve the right, but have no obligation, to
                        intercede in any disputes between users. The Service may contain User Content provided by other users. We are not responsible
                        for and do not control User Content. We have no obligation to review or monitor, and do not approve, endorse or make any
                        representations or warranties with respect to, User Content, including without limitation any User Content embodied by or
                        otherwise made available through Tokens. You use all User Content and interact with other users at your own risk. You agree
                        that Swoops will not be responsible for any liability incurred as the result of your interactions with other users. g.Open
                        Source Software . You acknowledge and agree that the Service may use, incorporate or link to certain software made available
                        under an “open- source” or “free” license (“OSS”), and that your use of the Service is subject 275222257 v1 to, and you agree
                        to comply with, any applicable OSS licenses. Each item of OSS is licensed under the terms of the end-user license that
                        accompanies such OSS. Nothing in these Terms limits your rights under, or grants you rights that supersede, the terms and
                        conditions of any applicable end user license for the OSS. If required by any license for particular OSS, Swoops makes such
                        OSS, and Swoops’ modifications thereto, available by written request at the notice address specified below. 3. CONNECTING A
                        DIGITAL WALLET; CONSENT TO ELECTRONIC COMMUNICATION a.Connecting a Digital Wallet; Registration Information . In order to use
                        certain features of the Service you will need to connect a compatible third-party digital wallet (a “Digital Wallet”) and
                        accept these Terms. You must be eighteen (18) years old to use the Service. When you connect your Digital Wallet to the
                        Website or otherwise use the Service, you may be asked to provide certain information to us (“Registration Information”). You
                        agree to (i) provide accurate, current, and complete Registration Information; (ii) maintain and promptly update your
                        Registration Information from time to time as necessary, (iii) maintain the security of your Digital Wallet and accept all
                        risks of unauthorized access thereto, and (iv) immediately notify us if you discover or otherwise suspect any security
                        breaches related to the Service or your Digital Wallet. Swoops may require you to provide additional information and documents
                        at any time, whether at the request of any competent authority or in order to help Swoops comply with applicable law,
                        regulation, or policy, including laws related to anti-laundering (legalization) of incomes obtained by criminal means, or for
                        counteracting financing of terrorism. Swoops may also require you to provide additional information and documents in cases
                        where it has reasons to believe that: ● Your Digital Wallet is being used for money laundering or for any other illegal
                        activity; ● You have concealed or reported false identification information and other Registration Information; or ●
                        Transactions effected via your Digital Wallet were effected in breach of these Terms. In such cases, Swoops, in its sole
                        discretion, may disable your ability to use the Service until such requested additional information and documents have been
                        reviewed by Swoops and accepted as satisfying the requirements of applicable law, regulation, or policy. If you do not provide
                        complete and accurate information and documents in response to such a request, Swoops may refuse to provide any Token,
                        Content, product, service, and/or further access to the Service to you. b.User Agreements . You agree that you will not: ●
                        buy, sell, rent, or lease access to the Service without our written permission; ● ● attempt to use the Service after removal
                        by us; or 275222257 v1 ● access or try to access the Service through unauthorized third party applications or clients.
                        c.Consent to Electronic Communications . By accepting these Terms, you consent to receive electronic communications from
                        Swoops (e.g., via email, message to your Digital Wallet, discord, or by posting notices to the Service). These communications
                        may include notices about your use of the Service (e.g., transactional information) and are part of your relationship with us.
                        You agree that any notices, agreements, disclosures or other communications that we send to you electronically will satisfy
                        any legal communication requirements, including, but not limited to, any requirements that such communications be in writing.
                        You should maintain copies of electronic communications from us by printing a paper copy or saving an electronic copy. We have
                        no obligation to store for your later use or access any such electronic communications that we make to you. We may also send
                        you promotional communications via email, including, but not limited to, newsletters, special offers, surveys and other news
                        and information we think will be of interest to you. You may opt out of receiving these promotional emails at any time by
                        following the unsubscribe instructions provided therein. d.User Representations and Warranties . When you connect a Digital
                        Wallet to the Service, you hereby represent and warrant, to and for the benefit of Swoops and its affiliates, as follows: ●
                        These Terms constitute your legal, valid and binding obligation, enforceable against you in accordance with these Terms. ● All
                        Registration Information and other information provided to Swoops by you is accurate and complete. None of: (i) you; (ii) any
                        affiliate of any entity on behalf of which you are entering into these Terms; (iii) any other person having a beneficial
                        interest in any entity on behalf of which you are entering into these Terms (or in any affiliate thereof); or (iv) any person
                        for whom you are acting as agent or nominee in connection with these Terms is: (A) a country, territory, entity or individual
                        named on an OFAC list as provided at http://www.treas.gov/ofac, or any person or entity prohibited under the OFAC programs,
                        regardless of whether or not they appear on the OFAC list; or (B) a senior foreign political figure, or any immediate family
                        member or close associate of a senior foreign political figure. ● These Terms do not, and the performance of your obligations
                        under these Terms will not: (i) if you are entering into these terms on behalf of an entity, conflict with or violate any of
                        the charter documents of such entity or any resolution adopted by its equity holders or other persons having governance
                        authority over the entity; (ii) contravene, conflict with or violate any right of any third party or any legal requirement
                        applicable to you or to any of the assets owned or used by you; or (iii) result in any breach of or constitute a default (or
                        an event that with notice or lapse of time or both would become a default) under any material contract or agreement to which
                        you are a party, permit held by you or legal requirement applicable to you. 275222257 v1 ● You are sophisticated, experienced
                        and knowledgeable in blockchain technology and the purchase of and transactions in Tokens. Additionally, you have conducted an
                        independent investigation of the Service and the matters contemplated by these Terms, have formed your own independent
                        judgment regarding the benefits and risks of and necessary and desirable practices regarding the foregoing and, in making the
                        determination to transact in any Tokens, you have relied solely on the results of such investigation and such independent
                        judgment. Without limiting the generality of the foregoing, you understand, acknowledge and agree that the legal requirements
                        pertaining to blockchain technologies and digital assets generally, including the Tokens, are evolving, and you have conducted
                        an independent investigation of such potentially applicable legal requirements and the resulting risks and uncertainties,
                        including the risk that one or more governmental entities or other persons may assert that any digital assets or cryptographic
                        tokens (including the Tokens) may constitute securities under applicable legal requirements. You hereby irrevocably disclaim
                        and disavow reliance upon any statements or representations made by or on behalf of, or information made available by, Swoops,
                        in determining to enter into these Terms, to purchase any Tokens, or otherwise use the Service. ● There is no legal proceeding
                        pending that relates to your activities relating to trading Tokens or other token- or digital asset- trading or blockchain
                        technology related activities. ● You are the sole and exclusive owner of all right, title and interest in and to all rights,
                        including intellectual property rights, incorporated into or otherwise used, held for use or practiced in connection with (or
                        planned by you to be incorporated into or otherwise used, held for use or practiced in connection with) any Token that you use
                        in connection with the Service, other than any intellectual property rights in and to such Token that are validly licensed to
                        you pursuant to valid and binding licenses granted to you. ● You have not failed to comply with, and have not violated, any
                        applicable legal requirement relating to any blockchain technologies or token-trading activities. No investigation or review
                        by any governmental entity is pending or, to your knowledge, has been threatened against or with respect to you, nor does any
                        government order or action prohibit you or any of your representatives from engaging in or continuing any conduct, activity or
                        practice relating to the Service and cryptocurrency. e.Responsibility for Fees . You must provide all equipment and software
                        necessary to connect to the Service. You are solely responsible for any fees, including Internet connection or mobile fees,
                        that you incur when accessing the Service. f.Independent Contractor . You acknowledge and agree that, notwithstanding any
                        payments made by Swoops to you, your relationship with Swoops is limited to that of an independent contractor, and not an
                        employee, joint venturer, sales representative, agent, franchisee or partner of Swoops for any 275222257 v1 reason. You
                        acknowledge and agree to act exclusively on behalf and for your own benefit, and not on behalf of, or for the benefit of,
                        Swoops. 4. PRICING; PAYMENTS a.General . All pricing and payment terms are as indicated at point of sale or otherwise on the
                        Service, and any payment obligations you incur are binding at the time of the applicable transaction. b.Gas Fees . You are
                        solely responsible for ensuring that any payment made by you is sufficient to cover any Gas Fee required to complete the
                        transaction. “Gas Fees” are transaction fees determined by market conditions on the blockchain at the time you effect a
                        transaction, and are not determined, set, or charged by Swoops. c.Payment Currency . You may not substitute any other currency
                        cryptocurrency) for the currency in which you have contracted to pay at the time you entered into an agreement. For clarity,
                        no fluctuation in the value of any currency, whether cryptocurrency or otherwise, shall impact or excuse your obligations with
                        respect to any other payment obligation. If the balance of cryptocurrency in your Digital Wallet is insufficient at the time
                        you seek to mint any Token or enter any Game, you may not be able to complete your desired transaction. Whether a particular
                        cryptocurrency is accepted as a payment method by Swoops is subject to change at any time in Swoops’ sole discretion. Swoops
                        may add or change any supported blockchains or payment processing services at any time in its sole discretion. All such
                        services may be subject to additional terms and conditions. 5. OWNERSHIP a.Content . Unless otherwise indicated in writing by
                        us, the Service and all content and other materials contained therein, including, without limitation, the Swoops logo and all
                        designs, text, graphics, pictures, information, data, software, sound files, other files and the selection and arrangement
                        thereof (collectively, “Content”) are the proprietary property of Swoops or our affiliates, licensors or users, as applicable.
                        b.Third-Party Licenses . Notwithstanding anything to the contrary in these Terms, the Service and Content may include software
                        components provided by Swoops or its affiliates or a third party that are subject to separate license terms, in which case
                        those license terms will govern such software components. c.License to Service and Content . You are hereby granted a limited,
                        revocable, nonexclusive, nontransferable, non-assignable, non-sublicensable, “as-is” license to access and use the Service and
                        Content for your own personal, non-commercial use; provided, however, that such license is subject to these Terms and does not
                        include any right to (i) sell, resell, or use commercially the Service or Content, (ii) distribute, publicly perform, or
                        publicly display any Content, (iii) modify or otherwise make any derivative uses of the Service or Content, or any portion
                        thereof, (iv) use any data mining, robots, or similar data gathering or extraction methods, (v) download (other than page
                        caching) any portion of the Service or Content, except as expressly permitted by us, and (vi) use the Service or Content other
                        than for their intended 275222257 v1 purposes. This license is subject to your compliance with the Acceptable Use Policy set
                        forth in Section 8 below. d.Tokens . Your rights in Tokens made available through the Service may be subject to certain
                        restrictions or limitations, as determined by us and as stated on the Service. By minting, purchasing, or otherwise acquiring
                        a Token, you agree to comply with any terms, including licenses or payment rights that are embedded within or otherwise
                        included with any Token that you purchase, including without limitation the applicable NFT Terms. 6. USER CONTENT The Service
                        may include the ability for you to make certain Content available on or through the Service, including without limitation
                        through comment forums or chat features (“User Content”). If you choose to make User Content available on or through the
                        Service, you hereby grant Swoops a fully paid, royalty-free, worldwide, non-exclusive right (including any moral rights) and
                        license to use, sublicense, distribute, reproduce, modify, adapt, and display, such User Content (in whole or in part) for the
                        purposes of (i) providing the Service, including making User Content available to other users in accordance with your
                        elections on the Service; and (ii) improving the Service. You also hereby grant each other User of the Service a non-exclusive
                        license to access your User Content through the Service, and to use, reproduce, distribute, display and perform such User
                        Content solely as permitted through the functionality of the Service and under these Terms. You are solely responsible for any
                        User Content you provide. You represent and warrant that such Content will not be libelous or defamatory and that you have, or
                        have obtained, all rights, licenses, consents, permissions, power and/or authority necessary to grant the rights granted
                        herein for any User Content that you submit, post or display on or through the Service. You agree that such User Content will
                        not contain material the use of which as permitted herein is violative of copyright or other proprietary rights. Swoops has no
                        responsibility for the User Content posted or listed via the Service, although Swoops reserves the right (but Swoops has no
                        obligation) to remove any User Content for any reason or for no reason, including in the event that Swoops determines Content
                        to be in violation of these Terms. 7. THIRD-PARTY SERVICES; THIRD-PARTY TERMS a.Third-Party Services . The Service may contain
                        links to third-party properties and applications (collectively, “Third-Party Services”). When you click on a link to a
                        Third-Party Service, you are subject to the terms and conditions (including privacy policies) of another property or
                        application. Such Third- Party Services. Swoops is not responsible for any Third-Party Services. Swoops provides links to
                        these Third-Party Services only as a convenience and does not review, approve, monitor, endorse, warrant, or make any
                        representations with respect to Third-Party Services, or their products or services. You use all links in Third-Party Services
                        at your own risk. When you leave our Service, our Terms and policies no longer govern. You should review all applicable
                        agreements and policies, including privacy and data gathering practices, of any Third-Party Services, and should make whatever
                        investigation you feel necessary or appropriate before proceeding with any transaction with any third party. 275222257 v1
                        b.Terms Applicable to Third-Party Services . The Service and Content may include components, including software components,
                        that are provided by a third party and that are subject to separate license terms, in which case those license terms will
                        govern your access to and use of such components. 8. ACCEPTABLE USE POLICY You agree that you are solely responsible for your
                        conduct while accessing or using the Service. You agree that you will abide by these Terms and will not: a.Provide false or
                        misleading information to Swoops; b.Use or attempt to use another user’s Digital Wallet without authorization from such user
                        and Swoops; c.List or attempt to list counterfeit Tokens; d.Pose as another person or create a misleading username;
                        e.Circumvent or attempt to circumvent any limitations or restrictions placed on promotions offered by Swoops; f.Use the
                        Service in any manner that could interfere with, disrupt, negatively affect or inhibit other users from fully enjoying the
                        Service, or that could damage, disable, overburden or impair the functioning of the Service in any manner; g.Develop, utilize,
                        or disseminate any software, or interact with any API in any manner, that could damage, harm, or impair the Service; h.Reverse
                        engineer any aspect of the Service, or do anything that might discover source code or bypass or circumvent measures employed
                        to prevent or limit access to any service, area, or code of the Service; i.Attempt to circumvent any content-filtering
                        techniques we employ, or attempt to access any feature or area of the Service that you are not authorized to access; j.Use any
                        robot, spider, crawler, scraper, script, browser extension, offline reader, or other automated means or interface not
                        authorized by us to access the Service, extract data or otherwise interfere with or modify the rendering of Service pages or
                        functionality; k.Collect or harvest data from our Service that would allow you to contact individuals, companies, or other
                        persons or entities, or use any such data to contact such entities; l.Use data collected from our Service for any direct
                        marketing activity (including without limitation, email marketing, SMS marketing, telemarketing, unsolicited airdrops, and
                        direct marketing); m.Bypass or ignore instructions that control all automated access to the Service; n.Use the Service for any
                        illegal or unauthorized purpose, or engage in, encourage, or promote any activity that violates any applicable law or these
                        Terms; 275222257 v1 o.Use the Service to carry out any illegal activities, or use the Digital Wallet that you use in
                        connection with the Service in connection with any illegal activities, including but not limited to money laundering,
                        terrorist financing or deliberately engaging in activities designed to adversely affect the performance of the Service;
                        p.Engage in or knowingly facilitate any “front-running,” “wash trading,” “pump and dump trading,” “ramping,” “cornering” or
                        fraudulent, deceptive or manipulative trading activities, including: ● trading a Token at successively lower or higher prices
                        for the purpose of creating or inducing a false, misleading or artificial appearance of activity in such Token, unduly or
                        improperly influencing the market price for such Token trading on the Service or establishing a price which does not reflect
                        the true state of the market in such Token; ● executing or causing the execution of any transaction in a Token which involves
                        no material change in the beneficial ownership thereof; or ● participating in, facilitating, assisting or knowingly
                        transacting with any pool, syndicate or joint account organized for the purpose of unfairly or deceptively influencing the
                        market price of any Token; q.Use the Service to carry out any financial activities subject to registration or licensing,
                        including but not limited to using the Service to transact in securities, commodities futures, trading of commodities on a
                        leveraged, margined or financed basis, binary options (including prediction-market transactions), real estate or real estate
                        leases, equipment leases, debt financings, equity financings or other similar transactions; r.Circumvent or attempt to
                        circumvent any restrictions placed on any User’s ability to view, learn, and/or modify Player Attributes. 12. COPYRIGHT It is
                        our policy to terminate membership privileges of any user who repeatedly infringes copyright upon prompt notification to
                        Swoops by the copyright owner or the copyright owner’s legal agent. Without limiting the foregoing, if you believe that your
                        work has been copied and made available on the Service in a way that constitutes copyright infringement, please provide our
                        Copyright Agent with the following information: (1) an electronic or physical signature of the person authorized to act on
                        behalf of the owner of the copyright interest; (2) a description of the copyrighted work that you claim has been infringed;
                        (3) a description of the location on the Service of the material that you claim is infringing; (4) your address, telephone
                        number and e-mail address; (5) a written statement by you that you have a good faith belief that the disputed use is not
                        authorized by the copyright owner, its agent or the law; and (6) a statement by you, made under penalty of perjury, that the
                        above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright
                        owner’s behalf. Contact information for Swoops’ Copyright Agent for notice of claims of copyright infringement is as follows:
                        Swoops, c/o Copyright Agent, 2930 Domingo Ave, Unit 1314, Berkeley, CA 94705-2454. 13. INVESTIGATIONS 275222257 v1 If Swoops
                        becomes aware of any possible violations by you of these Terms, Swoops reserves the right to investigate such violations. If,
                        as a result of the investigation, Swoops believes that criminal activity may have occurred, Swoops reserves the right to refer
                        the matter to, and to cooperate with, any and all applicable legal authorities. Swoops is entitled, except to the extent
                        prohibited by applicable law, to disclose to third parties any information or materials (including without limitation User
                        Content) in Swoops’ possession, including in order to: (i) comply with applicable laws, legal process or governmental request;
                        (ii) enforce these Terms, (iii) respond to any claims that User Content violates the rights of third parties, (iv) respond to
                        your requests for customer service, or (v) protect the rights, property or personal safety of Swoops, its users, or the
                        public, as Swoops in its sole discretion believes to be necessary or appropriate. By agreeing to these Terms, you hereby
                        provide your irrevocable consent to such monitoring. You understand, acknowledge, and agree that you have no expectation of
                        privacy concerning your use of the Service, including without limitation text, voice, or video communications. 14. RELEASE;
                        COMPLAINTS You hereby release and forever discharge Swoops and our officers, employees, agents, successors, and assigns (the
                        “Swoops Entities”) from, and hereby waive and relinquish, each and every past, present and future dispute, claim, controversy,
                        demand, right, obligation, liability, action and cause of action of every kind and nature (including personal injuries, death,
                        and property damage), that has arisen or arises directly or indirectly out of, or that relates directly or indirectly to, the
                        Service (including any interactions with, or act or omission of, other users). IN CONNECTION WITH THE FOREGOING YOU HEREBY
                        WAIVE CALIFORNIA CIVIL CODE SECTION 1542, OR ANY SIMILAR LAW OR RULE IN YOUR JURISDICTION, WHICH STATES IN SUBSTANCE: “A
                        GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR OR RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR
                        HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER
                        SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY.” In accordance with California Civil Code §1789.3, you may report complaints to
                        the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs by
                        contacting them in writing at 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834, or by telephone at (800) 952-5210.
                        15. ASSUMPTION OF RISK You acknowledge and agree that: a. The prices of digital assets are extremely volatile. Fluctuations in
                        the price of other digital assets could materially and adversely affect the value of the Tokens. b. You are solely responsible
                        for determining what, if any, taxes apply to any transaction involving Tokens. Neither Swoops nor any other Swoops Entity is
                        responsible for determining the taxes that may apply to Tokens. c. Tokens exist and can be transferred only by virtue of the
                        ownership record maintained on the blockchain supporting such Tokens. Our Service does not 275222257 v1 store, send, or
                        receive Tokens. Any transfer of Tokens occurs within the supporting blockchain and not on the Service. d. There are risks
                        associated with using digital currency, including but not limited to the risk of hardware, software and Internet connections,
                        the risk of malicious software introduction, and the risk that third parties may obtain unauthorized access to information
                        stored within your Digital Wallet. e. There are risks associated with use of blockchain technology, including but not limited
                        to security flaws and vulnerabilities, bugs, and other factors. Swoops makes no representations as to the security of the
                        underlying blockchain, and you transact on any blockchain at your own risk. f. Swoops does not monitor, and is not liable to
                        you for, any user activity in connection with the Service. Swoops cannot control, and makes no representations with respect
                        to, the behavior of any other User, including without limitation any actions taken in violation of applicable Game rules or
                        these Terms. g. The legal and regulatory regime governing blockchain technologies, cryptocurrencies, and tokens is uncertain,
                        and new regulations or policies may materially adversely affect the development of the Service and the utility of Tokens. h.
                        There are risks associated with Tokens, including but not limited to, the risk of purchasing counterfeit assets, mislabeled
                        assets, assets that are vulnerable to metadata decay, assets on smart contracts with bugs, and assets that may become
                        untransferable. i. Swoops reserves the right to hide collections, contracts, and assets that Swoops suspects or believes may
                        violate these Terms. Tokens you purchase or Own may become inaccessible on the Service. Under no circumstances shall the
                        inability to view your assets on the Service serve as grounds for a claim against Swoops. 16. INDEMNIFICATION To the fullest
                        extent permitted by applicable law, you agree to indemnify, defend, and hold harmless Swoops and the Swoops Entities from and
                        against all actual or alleged third party claims, damages, awards, judgments, losses, liabilities, obligations, penalties,
                        interest, fees, expenses (including, without limitation, attorneys’ fees and expenses) and costs (including, without
                        limitation, court costs, costs of settlement, and costs of or associated with pursuing indemnification and insurance), of
                        every kind and nature whatsoever arising out of or related to these Terms or your use of the Service or the Service, whether
                        known or unknown, foreseen or unforeseen, matured or unmatured, or suspected or unsuspected, in law or equity, whether in
                        tort, contract or otherwise (collectively, “Claims”), including, but not limited to, damages to property or personal injury,
                        that are caused by, arise out of or are related to (a) your use or misuse of the Service, User Content, or any Tokens, (b) any
                        feedback you provide, (c) your violation of these Terms, and (d) your violation of the rights of any third party, including
                        another user. You agree to promptly notify Swoops of any third-party Claims and cooperate with the Swoops Entities in
                        defending such Claims. You further agree that the Swoops Entities shall have control of the 275222257 v1 defense or settlement
                        of any third-party Claims. THIS INDEMNITY IS IN ADDITION TO, AND NOT IN LIEU OF, ANY OTHER INDEMNITIES SET FORTH IN A SEPARATE
                        WRITTEN AGREEMENT BETWEEN YOU AND SWOOPS. 17. DISCLAIMERS THE SERVICE, CONTENT CONTAINED THEREIN, AND TOKENS LISTED THEREIN,
                        ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                        SWOOPS (AND ITS SUPPLIERS) MAKE NO WARRANTY THAT THE SERVICE: (A) WILL MEET YOUR REQUIREMENTS; (B) WILL BE AVAILABLE ON AN
                        UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS; OR (C) WILL BE ACCURATE, RELIABLE, COMPLETE, LEGAL, OR SAFE. SWOOPS
                        DISCLAIMS ALL OTHER WARRANTIES OR CONDITIONS, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OR
                        CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON- INFRINGEMENT AS TO THE SERVICE OR ANY CONTENT
                        CONTAINED THEREIN. SWOOPS DOES NOT REPRESENT OR WARRANT THAT THE SERVICE OR CONTENT ON THE SERVICE IS ACCURATE, COMPLETE,
                        RELIABLE, CURRENT, OR ERROR- FREE. WE WILL NOT BE LIABLE FOR ANY LOSS OF ANY KIND FROM ANY ACTION TAKEN OR TAKEN IN RELIANCE
                        ON MATERIAL OR INFORMATION, CONTAINED ON THE SERVICE. WHILE SWOOPS ATTEMPTS TO MAKE YOUR ACCESS TO AND USE OF THE SERVICE AND
                        CONTENT SAFE, SWOOPS CANNOT AND DOES NOT REPRESENT OR WARRANT THAT THE SERVICE, CONTENT, OR ANY TOKENS LISTED ON OUR SERVICE
                        ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE CANNOT GUARANTEE THE SECURITY OF ANY DATA THAT YOU DISCLOSE ONLINE. YOU
                        ACCEPT THE INHERENT SECURITY RISKS OF PROVIDING INFORMATION AND DEALING ONLINE OVER THE INTERNET AND WILL NOT HOLD US
                        RESPONSIBLE FOR ANY BREACH OF SECURITY UNLESS IT IS DUE TO OUR GROSS NEGLIGENCE. WE WILL NOT BE RESPONSIBLE OR LIABLE TO YOU
                        FOR ANY LOSSES YOU SUSTAIN AS A RESULT OF YOUR USE OF THE SERVICE. WE TAKE NO RESPONSIBILITY FOR, AND WILL NOT BE LIABLE TO
                        YOU FOR, ANY USE OF TOKENS, INCLUDING BUT NOT LIMITED TO ANY LOSSES, DAMAGES OR CLAIMS ARISING FROM: (I) USER ERROR SUCH AS
                        FORGOTTEN PASSWORDS, INCORRECTLY CONSTRUCTED TRANSACTIONS, OR MISTYPED ADDRESSES; (II) SERVER FAILURE OR DATA LOSS; (III)
                        CORRUPTED DIGITAL WALLET FILES; (IV) UNAUTHORIZED ACCESS TO APPLICATIONS; (V) ANY UNAUTHORIZED THIRD PARTY ACTIVITIES,
                        INCLUDING WITHOUT LIMITATION THE USE OF VIRUSES, PHISHING, BRUTEFORCING OR OTHER MEANS OF ATTACK AGAINST THE SERVICE OR
                        TOKENS; (VI) YOUR USE OF OR FAILURE TO USE THE SWOOPS PROTOCOL; OR (VII) ANY USE OR MISUSE OF THE SERVICE BY YOU OR ANY THIRD
                        PARTY. FROM TIME TO TIME, SWOOPS MAY OFFER NEW “BETA” FEATURES OR TOOLS. ALL SUCH FEATURES OR TOOLS ARE OFFERED “AS IS” AND
                        WITH ALL FAULTS, SOLELY FOR EXPERIMENTAL PURPOSES AND WITHOUT ANY WARRANTY OF ANY KIND, AND MAY BE MODIFIED OR DISCONTINUED AT
                        SWOOPS’S SOLE DISCRETION. THE PROVISIONS OF THIS SECTION APPLY WITH FULL FORCE TO SUCH FEATURES OR TOOLS. 275222257 v1 TOKENS
                        ARE INTANGIBLE DIGITAL ASSETS. THEY EXIST ONLY BY VIRTUE OF THE OWNERSHIP RECORD MAINTAINED IN THE BLOCKCHAIN NETWORK. ANY
                        TRANSFER OF TITLE THAT MIGHT OCCUR IN ANY UNIQUE DIGITAL ASSET OCCURS ON THE DECENTRALIZED LEDGER WITHIN THE BLOCKCHAIN
                        NETWORK. WE DO NOT GUARANTEE THAT SWOOPS OR ANY SWOOPS ENTITY CAN EFFECT THE TRANSFER OF TITLE OR RIGHT IN ANY TOKENS. WE
                        CANNOT AND DO NOT GUARANTEE THAT ANY TOKEN WILL HAVE OR RETAIN ANY INHERENT VALUE, OR THAT YOU WILL BE ABLE TO RECEIVE OR
                        ACCESS ANY TOKEN ACCESS PRIVILEGES OR OTHER BENEFITS ASSOCIATED WITH ANY TOKEN THAT YOU MINT THROUGH THE SERVICE. Swoops is
                        not responsible for any losses or harms sustained by you due to vulnerability or any kind of failure, abnormal behavior of
                        software (e.g., wallet, smart contract), blockchains, or any other features of or inherent to the Tokens. Swoops is not
                        responsible for casualties due to developers or representatives delay or failure to report any issues with any blockchain
                        supporting Tokens, including without limitation forks, technical node issues, or any other issues that result in losses of any
                        sort, including without limitation any issues arising from or related to any Games. Nothing in these Terms shall exclude or
                        limit liability of either party for fraud, death or bodily injury caused by negligence, violation of laws, or any other
                        activity that cannot be limited or excluded under the laws applicable to your jurisdiction. SOME JURISDICTIONS DO NOT ALLOW
                        THE EXCLUSION OF IMPLIED WARRANTIES IN CONTRACTS WITH CONSUMERS, SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. 18. LIMITATION
                        OF LIABILITY TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL SWOOPS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST
                        PROFIT OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES ARISING FROM THESE TERMS, THE
                        SERVICE, ANY TOKENS, YOUR USE OF OR INABILITY TO USE THE SWOOPS PROTOCOL FOR ANY PURPOSE, OR FOR ANY DAMAGES RELATED TO LOSS
                        OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, OR LOSS OF DATA, AND
                        WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE AND EVEN IF SWOOPS HAS
                        BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF, THE SERVICE IS UNDERTAKEN BY YOU AT YOUR OWN
                        DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER SYSTEM OR MOBILE DEVICE OR LOSS OF
                        DATA RESULTING THEREFROM. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, IN NO EVENT SHALL THE MAXIMUM AGGREGATE
                        LIABILITY OF SWOOPS ARISING OUT OF OR IN ANY WAY RELATED TO THESE TERMS, YOUR ACCESS TO AND USE OF THE SERVICE, CONTENT
                        (INCLUDING YOUR CONTENT), YOUR USE OF OR INABILITY TO USE ANY GAME, OR ANY TOKENS MINTED THROUGH THE SERVICE EXCEED THE
                        GREATER OF (A) $100 OR (B) THE AMOUNT PAID TO SWOOPS BY YOU FOR THE SERVICE IN THE TRANSACTION OR INCIDENT THAT IS THE SUBJECT
                        OF THE CLAIM. 275222257 v1 Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages,
                        so the above limitation or exclusion may not apply to you. 19. DISPUTE RESOLUTION. Please read this Arbitration Agreement (the
                        “Arbitration Agreement”) carefully. It is part of your contract with Swoops and affects your rights. It contains procedures
                        for MANDATORY BINDING ARBITRATION AND A CLASS ACTION WAIVER. a.Applicability of Arbitration Agreement. Subject to the terms of
                        this Arbitration Agreement, you and Swoops agree that any dispute, claim, disagreements arising out of or relating in any way
                        to your access to or use of the Service, any communications you receive from us, any products (including any Tokens) minted by
                        you through the Service, any use of or interaction with any Game (including any failure of the same) or the Terms and prior
                        versions of the Terms, including claims and disputes that arose between us before the effective date of these Terms (each, a
                        “Dispute”) will be resolved by binding arbitration, rather than in court, except that: (1) you and Swoops may assert claims or
                        seek relief in small claims court if such claims qualify and remain in small claims court; and (2) you or Swoops may seek
                        equitable relief in court for infringement or other misuse of intellectual property rights (such as trademarks, trade dress,
                        domain names, trade secrets, copyrights, and patents). For purposes of this Arbitration Agreement, “Dispute” will also include
                        disputes that arose or involve facts occurring before the existence of this or any prior versions of the Terms as well as
                        claims that may arise after the termination of these Terms. b. Informal Dispute Resolution. There might be instances when a
                        Dispute arises between you and Swoops. If that occurs, Swoops is committed to working with you to reach a reasonable
                        resolution. You and Swoops agree that good faith informal efforts to resolve Disputes can result in a prompt, low‐cost and
                        mutually beneficial outcome. You and Swoops therefore agree that before either party commences arbitration against the other
                        (or initiates an action in small claims court if a party so elects), we will personally meet and confer telephonically or via
                        videoconference, in a good faith effort to resolve informally any Dispute covered by this Arbitration Agreement (“Informal
                        Dispute Resolution Conference”). If you are represented by counsel, your counsel may participate in the conference, but you
                        will also participate in the conference. The party initiating a Dispute must give notice to the other party in writing of its
                        intent to initiate an Informal Dispute Resolution Conference (“Notice”), which shall occur within 45 days after the other
                        party receives such Notice, unless an extension is mutually agreed upon by the parties. Notice to Swoops that you intend to
                        initiate an Informal Dispute Resolution Conference should be sent by email to the contact information set forth in Section 21.
                        The Notice must include: (1) your name, telephone number, mailing address, e‐mail address and/or Digital Wallet address (if
                        you have one); (2) the name, telephone number, mailing address and e‐mail address of your counsel, if any; and (3) a
                        description of your Dispute. The Informal Dispute Resolution Conference shall be individualized such that a separate
                        conference must be held each time either party initiates a Dispute, even if the same law firm or group of law firms represents
                        multiple users in similar cases, 275222257 v1 unless all parties agree; multiple individuals initiating a Dispute cannot
                        participate in the same Informal Dispute Resolution Conference unless all parties agree. In the time between a party receiving
                        the Notice and the Informal Dispute Resolution Conference, nothing in this Arbitration Agreement shall prohibit the parties
                        from engaging in informal communications to resolve the initiating party’s Dispute. Engaging in the Informal Dispute
                        Resolution Conference is a condition precedent and requirement that must be fulfilled before commencing arbitration. The
                        statute of limitations and any filing fee deadlines shall be tolled while the parties engage in the Informal Dispute
                        Resolution Conference process required by this section. c.Waiver of Jury Trial. YOU AND SWOOPS HEREBY WAIVE ANY CONSTITUTIONAL
                        AND STATUTORY RIGHTS TO SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and Swoops are instead electing that
                        all Disputes shall be resolved by arbitration under this Arbitration Agreement, except as specified in the subsection entitled
                        “Applicability of Arbitration Agreement” above. There is no judge or jury in arbitration, and court review of an arbitration
                        award is subject to very limited review. d.Waiver of Class and Other Non-Individualized Relief. YOU AND SWOOPS AGREE THAT,
                        EXCEPT AS SPECIFIED IN SUBSECTION 19 .i, EACH OF US MAY BRING CLAIMS AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT ON
                        A CLASS, REPRESENTATIVE, OR COLLECTIVE BASIS, AND THE PARTIES HEREBY WAIVE ALL RIGHTS TO HAVE ANY DISPUTE BE BROUGHT, HEARD,
                        ADMINISTERED, RESOLVED, OR ARBITRATED ON A CLASS, COLLECTIVE, REPRESENTATIVE, OR MASS ACTION BASIS. ONLY INDIVIDUAL RELIEF IS
                        AVAILABLE, AND DISPUTES OF MORE THAN ONE CUSTOMER OR USER CANNOT BE ARBITRATED OR CONSOLIDATED WITH THOSE OF ANY OTHER
                        CUSTOMER OR USER. Subject to this Arbitration Agreement, the arbitrator may award declaratory or injunctive relief only in
                        favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by the party’s
                        individual claim. Nothing in this paragraph is intended to, nor shall it, affect the terms and conditions under the subsection
                        19.i entitled “Batch Arbitration.” Notwithstanding anything to the contrary in this Arbitration Agreement, if a court decides
                        by means of a final decision, not subject to any further appeal or recourse, that the limitations of this subsection, “Waiver
                        of Class and Other Non-Individualized Relief,” are invalid or unenforceable as to a particular claim or request for relief
                        (such as a request for public injunctive relief), you and Swoops agree that that particular claim or request for relief (and
                        only that particular claim or request for relief) shall be severed from the arbitration and may be litigated in the state or
                        federal courts located in the State of California. All other Disputes shall be arbitrated or litigated in small claims court.
                        This subsection does not prevent you or Swoops from participating in a class-wide settlement of claims. e.Rules and Forum. The
                        Terms evidence a transaction involving interstate commerce; and notwithstanding any other provision herein with respect to the
                        applicable substantive law, the Federal Arbitration Act, 9 U.S.C. § 1 et seq., will govern the interpretation and enforcement
                        of this Arbitration Agreement and 275222257 v1 any arbitration proceedings. If the Informal Dispute Resolution Conference
                        process described above does not resolve satisfactorily within sixty (60) days after receipt of your Notice, you and Swoops
                        agree that either party shall have the right to finally resolve the Dispute through binding arbitration. The arbitration will
                        be administered by the American Arbitration Association (“AAA”), in accordance with the Consumer Arbitration Rules (the “AAA
                        Rules”) then in effect, except as modified by this section of this Arbitration Agreement. The AAA Rules are currently
                        available at https://www.adr.org/sites/default/files/Consumer%20Rules.pdf. A party who wishes to initiate arbitration must
                        provide the other party with a request for arbitration (the “Request”). The Request must include: (1) the name, telephone
                        number, mailing address, e‐mail address of the party seeking arbitration (if applicable) as well as the applicable Digital
                        Wallet address; (2) a statement of the legal claims being asserted and the factual bases of those claims; (3) a description of
                        the remedy sought and an accurate, good‐faith calculation of the amount in controversy in United States Dollars; (4) a
                        statement certifying completion of the Informal Dispute Resolution Conference process as described above; and (5) evidence
                        that the requesting party has paid any necessary filing fees in connection with such arbitration. If the party requesting
                        arbitration is represented by counsel, the Request shall also include counsel’s name, telephone number, mailing address, and
                        email address. Such counsel must also sign the Request. By signing the Request, counsel certifies to the best of counsel’s
                        knowledge, information, and belief, formed after an inquiry reasonable under the circumstances, that: (1) the Request is not
                        being presented for any improper purpose, such as to harass, cause unnecessary delay, or needlessly increase the cost of
                        dispute resolution; (2) the claims, defenses and other legal contentions are warranted by existing law or by a nonfrivolous
                        argument for extending, modifying, or reversing existing law or for establishing new law; and (3) the factual and damages
                        contentions have evidentiary support or, if specifically so identified, will likely have evidentiary support after a
                        reasonable opportunity for further investigation or discovery. Unless you and Swoops otherwise agree, or the Batch Arbitration
                        process discussed in subsection 19.i is triggered, the arbitration will be conducted in the county where you reside. Subject
                        to the AAA Rules, the arbitrator may direct a limited and reasonable exchange of information between the parties, consistent
                        with the expedited nature of the arbitration. If the AAA is not available to arbitrate, the parties will select an alternative
                        arbitral forum. Your responsibility to pay any AAA fees and costs will be solely as set forth in the applicable AAA Rules. You
                        and Swoops agree that all materials and documents exchanged during the arbitration proceedings shall be kept confidential and
                        shall not be shared with anyone except the parties’ attorneys, accountants, or business advisors, and then subject to the
                        condition that they agree to keep all materials and documents exchanged during the arbitration proceedings confidential.
                        f.Arbitrator. The arbitrator will be either a retired judge or an attorney licensed to practice law in the state of Florida
                        and will be selected by the parties from the AAA’s roster of consumer dispute arbitrators. If the parties are unable to agree
                        upon an arbitrator within thirty-five (35) days of delivery of the Request, then the AAA will appoint the arbitrator in
                        accordance with the 275222257 v1 AAA Rules, provided that if the Batch Arbitration process under subsection 19.i is triggered,
                        the AAA will appoint the arbitrator for each batch. g.Authority of Arbitrator. The arbitrator shall have exclusive authority
                        to resolve any Dispute, including, without limitation, disputes arising out of or related to the interpretation or application
                        of the Arbitration Agreement, including the enforceability, revocability, scope, or validity of the Arbitration Agreement or
                        any portion of the Arbitration Agreement, except for the following: (1) all Disputes arising out of or relating to the
                        subsection entitled “Waiver of Class and Other Non-Individualized Relief,” including any claim that all or part of the
                        subsection entitled “Waiver of Class and Other Non- Individualized Relief” is unenforceable, illegal, void or voidable, or
                        that such subsection entitled “Waiver of Class and Other Non-Individualized Relief” has been breached, shall be decided by a
                        court of competent jurisdiction and not by an arbitrator; (2) except as expressly contemplated in the subsection entitled
                        “Batch Arbitration,” all Disputes about the payment of arbitration fees shall be decided only by a court of competent
                        jurisdiction and not by an arbitrator; (3) all Disputes about whether either party has satisfied any condition precedent to
                        arbitration shall be decided only by a court of competent jurisdiction and not by an arbitrator; and (4) all Disputes about
                        which version of the Arbitration Agreement applies shall be decided only by a court of competent jurisdiction and not by an
                        arbitrator. The arbitration proceeding will not be consolidated with any other matters or joined with any other cases or
                        parties, except as expressly provided in the subsection entitled “Batch Arbitration.” The arbitrator shall have the authority
                        to grant motions dispositive of all or part of any Dispute. The arbitrator shall issue a written award and statement of
                        decision describing the essential findings and conclusions on which the award is based, including the calculation of any
                        damages awarded. The award of the arbitrator is final and binding upon you and us. Judgment on the arbitration award may be
                        entered in any court having jurisdiction. h.Attorneys’ Fees and Costs. The parties shall bear their own attorneys’ fees and
                        costs in arbitration unless the arbitrator finds that either the substance of the Dispute or the relief sought in the Request
                        was frivolous or was brought for an improper purpose (as measured by the standards set forth in Federal Rule of Civil
                        Procedure 11(b)). If you or Swoops need to invoke the authority of a court of competent jurisdiction to compel arbitration,
                        then the party that obtains an order compelling arbitration in such action shall have the right to collect from the other
                        party its reasonable costs, necessary disbursements, and reasonable attorneys’ fees incurred in securing an order compelling
                        arbitration. The prevailing party in any court action relating to whether either party has satisfied any condition precedent
                        to arbitration, including the Informal Dispute Resolution Conference process, is entitled to recover their reasonable costs,
                        necessary disbursements, and reasonable attorneys’ fees and costs. i.Batch Arbitration. To increase the efficiency of
                        administration and resolution of arbitrations, you and Swoops agree that in the event that there are one hundred (100) or more
                        individual Requests of a substantially similar nature filed against Swoops by or with the assistance of the same law firm,
                        275222257 v1 group of law firms, or organizations, within a thirty (30) day period (or as soon as possible thereafter), the
                        AAA shall (1) administer the arbitration demands in batches of 100 Requests per batch (plus, to the extent there are less than
                        100 Requests left over after the batching described above, a final batch consisting of the remaining Requests); (2) appoint
                        one arbitrator for each batch; and (3) provide for the resolution of each batch as a single consolidated arbitration with one
                        set of filing and administrative fees due per side per batch, one procedural calendar, one hearing (if any) in a place to be
                        determined by the arbitrator, and one final award (“Batch Arbitration”). All parties agree that Requests are of a
                        “substantially similar nature” if they arise out of or relate to the same event or factual scenario and raise the same or
                        similar legal issues and seek the same or similar relief. To the extent the parties disagree on the application of the Batch
                        Arbitration process, the disagreeing party shall advise the AAA, and the AAA shall appoint a sole standing arbitrator to
                        determine the applicability of the Batch Arbitration process (“Administrative Arbitrator”). In an effort to expedite
                        resolution of any such dispute by the Administrative Arbitrator, the parties agree the Administrative Arbitrator may set forth
                        such procedures as are necessary to resolve any disputes promptly. The Administrative Arbitrator’s fees shall be paid by
                        Swoops. You and Swoops agree to cooperate in good faith with the AAA to implement the Batch Arbitration process including the
                        payment of single filing and administrative fees for batches of Requests, as well as any steps to minimize the time and costs
                        of arbitration, which may include: (1) the appointment of a discovery special master to assist the arbitrator in the
                        resolution of discovery disputes; and (2) the adoption of an expedited calendar of the arbitration proceedings. This Batch
                        Arbitration provision shall in no way be interpreted as authorizing a class, collective and/or mass arbitration or action of
                        any kind, or arbitration involving joint or consolidated claims under any circumstances, except as expressly set forth in this
                        provision. j.30-Day Right to Opt Out. You have the right to opt out of the provisions of this Arbitration Agreement by sending
                        written notice of your decision to opt out to the address set forth in Section 21, within thirty (30) days after first
                        becoming subject to this Arbitration Agreement. Your notice must include your name and address, email address, Digital Wallet
                        address (if you have one), and an unequivocal statement that you want to opt out of this Arbitration Agreement. If you opt out
                        of this Arbitration Agreement, all other parts of these Terms will continue to apply to you. Opting out of this Arbitration
                        Agreement has no effect on any other arbitration agreements that you may currently have, or may enter in the future, with us.
                        k. Invalidity, Expiration. Except as provided in the subsection entitled “Waiver of Class and Other Non-Individualized
                        Relief”, if any part or parts of this Arbitration Agreement are found under the law to be invalid or unenforceable, then such
                        specific part or parts shall be of no force and effect and shall be severed and the remainder of the Arbitration Agreement
                        shall continue in full force and effect. You further agree that any Dispute that you have with Swoops as detailed in this
                        Arbitration Agreement must be initiated via arbitration within the applicable statute of limitation for that claim or
                        controversy, or it will be forever time barred. Likewise, you agree that all 275222257 v1 applicable statutes of limitation
                        will apply to such arbitration in the same manner as those statutes of limitation would apply in the applicable court of
                        competent jurisdiction. l.Modification. Notwithstanding any provision in these Terms to the contrary, we agree that if Swoops
                        makes any future material change to this Arbitration Agreement, it will notify you. Unless you reject the change within thirty
                        (30) days of such change become effective by writing to Swoops at the address set forth in Section 21, your continued use of
                        the Service, including the acceptance of products and services offered on the Service following the posting of changes to this
                        Arbitration Agreement, constitutes your acceptance of any such changes. Changes to this Arbitration Agreement do not provide
                        you with a new opportunity to opt out of the Arbitration Agreement if you have previously agreed to a version of these Terms
                        and did not validly opt out of arbitration. If you reject any change or update to this Arbitration Agreement, and you were
                        bound by an existing agreement to arbitrate Disputes arising out of or relating in any way to your access to or use of the
                        Services, any communications you receive, or these Terms, the provisions of this Arbitration Agreement as of the date you
                        first accepted the Terms (or accepted any subsequent changes to these Terms) remain in full force and effect. Swoops will
                        continue to honor any valid opt outs of the Arbitration Agreement that you made to a prior version of these Terms.
                        m.Confidentiality. All aspects of the arbitration proceeding, including but not limited to the award of the arbitrator and
                        compliance therewith, shall be strictly confidential. The parties agree to maintain confidentiality unless otherwise required
                        by law. This paragraph shall not prevent a party from submitting to a court of law any information necessary to enforce this
                        Agreement, to enforce an arbitration award, or to seek injunctive or equitable relief. n.Survival of Agreement. This
                        Arbitration Agreement will survive the termination of your relationship with Swoops. 20. GENERAL You may terminate these Terms
                        by disconnecting your Digital Wallet, ceasing all further use of the Service, and sending us notice of your intention to
                        terminate these Terms at the address set forth in Section 21, below; provided that these Terms will continue to apply to any
                        Token that you Own for so long as you Own such Token. We reserve the right in our sole discretion to modify, suspend, or
                        discontinue the Service, or any features or parts thereof, whether temporarily or permanently, at any time with or without
                        notice to you in our sole discretion. All sections of these Terms intended by their nature to survive, including without your
                        indemnification obligations, all disclaimers, your release of Swoops, and our limitation of liability hereunder, shall survive
                        such termination. These Terms, and your access to, and use of, the Service, shall be governed by and construed and enforced in
                        accordance with the laws of the state of California, without regard to any conflict of law rules or principles that would
                        cause the application of the laws of any other jurisdiction. Any dispute between the parties that is not subject to
                        arbitration or cannot be heard in small claims court, shall be resolved in the courts of California. Notwithstanding anything
                        contained in these Terms, we 275222257 v1 reserve the right, without notice and in our sole discretion, to terminate your
                        right to access or use the Service at any time and for any or no reason, and you acknowledge and agree that we shall have no
                        liability or obligation to you in such event and that you will not be entitled to a refund of any amounts that you have
                        already paid to us, to the fullest extent permitted by applicable law. If any term, clause or provision of these Terms is held
                        invalid or unenforceable, then that term, clause or provision will be severable from these Terms and will not affect the
                        validity or enforceability of any remaining part of that term, clause or provision, or any other term, clause or provision of
                        these Terms. These Terms, and any rights and licenses granted hereunder, may not be transferred or assigned by you without the
                        prior written consent of Swoops. Swoops’ failure to assert any right or provision under these Terms shall not constitute a
                        waiver of such right or provision. Except as otherwise provided herein, these Terms are intended solely for the benefit of
                        Swoops and you and are not intended to confer third party beneficiary rights upon any other person or entity. 21. CONTACT
                        INFORMATION MetaBall Inc. ATTN: Swoops Legal Address: 2930 Domingo Ave #1314, Berkeley, CA 94705-2454
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
