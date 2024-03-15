/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TokenPurchaseIntent = {
    phase?: string;
    wallet_address?: string;
    requested_amount: number;
    readonly status?: TokenPurchaseIntent.status;
};

export namespace TokenPurchaseIntent {

    export enum status {
        COMPLETED = 'COMPLETED',
        IN_PROGRESS = 'IN_PROGRESS',
    }


}
