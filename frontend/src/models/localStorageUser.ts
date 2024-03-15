import { User } from 'src/lib/api';

export type LocalStorageUser = User & {
    address?: string | null;
    is_web3_auth_user?: boolean | null;
};
