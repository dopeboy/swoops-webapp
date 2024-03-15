/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Contest = {
    readonly id?: number;
    readonly status?: Contest.status;
    readonly kind?: Contest.kind;
    readonly played_at?: string | null;
};

export namespace Contest {

    export enum status {
        OPEN = 'OPEN',
        COMPLETE = 'COMPLETE',
        IN_PROGRESS = 'IN_PROGRESS',
        VOIDED = 'VOIDED',
        ERROR = 'ERROR',
    }

    export enum kind {
        HEAD_TO_HEAD = 'HEAD_TO_HEAD',
        HEAD_TO_HEAD_MATCH_MAKE = 'HEAD_TO_HEAD_MATCH_MAKE',
        TOURNAMENT = 'TOURNAMENT',
    }


}
