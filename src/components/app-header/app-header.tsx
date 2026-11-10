import { selectUser } from '@/services/slices/user/userSelectors';
import { useSelector } from '@/services/store';
import { AppHeaderUI } from '@ui';
import { useMatch } from 'react-router-dom';

export const AppHeader = (): React.JSX.Element => {
  const userName = useSelector(selectUser)?.name;
  const constructorMatch = useMatch('/');
  const ingredientMatch = useMatch('/ingredients/:id');
  const isConstructorActive = Boolean(constructorMatch ?? ingredientMatch);

  // prettier-ignore
  return (
    <AppHeaderUI userName={userName} isConstructorActive={isConstructorActive} />
  );
};
