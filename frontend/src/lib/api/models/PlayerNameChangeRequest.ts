/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PlayerNameChangeRequest = {
    readonly status?: PlayerNameChangeRequest.status;
    name: string;
    readonly reject_reason?: string;
    readonly create_date?: string;
    readonly reviewed_on?: string | null;
};

export namespace PlayerNameChangeRequest {

    export enum status {
        PENDING = 'PENDING',
        ACCEPTED = 'ACCEPTED',
        REJECTED = 'REJECTED',
        CANCELED = 'CANCELED',
    }


}
