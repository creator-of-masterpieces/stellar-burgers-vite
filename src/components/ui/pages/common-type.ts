import type { AuthLocationState } from '@utils-types';
import type { Dispatch, SetStateAction, SyntheticEvent } from 'react';

export type PageUIProps = {
  isLoading?: boolean;
  locationState?: AuthLocationState | null;
  errorText: string | undefined;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: SyntheticEvent) => void;
};
