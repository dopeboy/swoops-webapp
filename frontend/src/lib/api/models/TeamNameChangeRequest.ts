/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TeamNameChangeRequest = {
    readonly create_date?: string;
    name: string;
    status?: TeamNameChangeRequest.status;
    reject_reason?: string;
};

export namespace TeamNameChangeRequest {

    export enum status {
        PENDING = 'PENDING',
        ACCEPTED = 'ACCEPTED',
        REJECTED = 'REJECTED',
        CANCELED = 'CANCELED',
    }


}
