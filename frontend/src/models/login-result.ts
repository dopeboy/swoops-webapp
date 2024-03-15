export interface LoginResult {
    account: string;
    chain: { id: number; unsupported: boolean };
    provider: any;
}
