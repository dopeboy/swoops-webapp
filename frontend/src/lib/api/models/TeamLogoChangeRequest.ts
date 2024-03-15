/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TeamLogoChangeRequest = {
    readonly create_date?: string;
    path: string;
    status?: TeamLogoChangeRequest.status;
    reject_reason?: string;
};

export namespace TeamLogoChangeRequest {

    export enum status {
        PENDING = 'PENDING',
        ACCEPTED = 'ACCEPTED',
        REJECTED = 'REJECTED',
        CANCELED = 'CANCELED',
    }


}
