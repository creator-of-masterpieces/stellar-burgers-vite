import { selectUser } from '@/services/slices/user/userSelectors';
import { useSelector } from '@/services/store';
import { AppHeaderUI } from '@ui';

export const AppHeader = (): React.JSX.Element => {
  const userName = useSelector(selectUser)?.name;

  // prettier-ignore
  return (
    <AppHeaderUI userName={userName} />
  );
};
