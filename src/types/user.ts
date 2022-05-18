import User from '../models/user';

export interface Asset {
  assetUrl?: string;
  assetName?: string;
  assetId: number;
  unitName?: string;
}

export interface RegistrationResult {
  status: string;
  asset?: Asset;
  registeredUser: User;
}
