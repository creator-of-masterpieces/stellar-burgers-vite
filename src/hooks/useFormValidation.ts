import { PASSWORD_MIN_LENGTH } from '@/utils/validation';
import { useState } from 'react';

import type { SyntheticEvent } from 'react';

type FieldErrors = Partial<Record<string, string>>;
type FormValidation = {
  errors: FieldErrors;
  onInvalid: (event: SyntheticEvent<HTMLFormElement>) => void;
  onBlur: (event: SyntheticEvent<HTMLFormElement>) => void;
  onChange: (event: SyntheticEvent<HTMLFormElement>) => void;
};

const requiredMessages: Record<string, string> = {
  email: 'Введите e-mail',
  name: 'Введите имя',
  password: 'Введите пароль',
  token: 'Введите код из письма',
};

const getFieldError = (input: HTMLInputElement): string => {
  if (input.validity.valueMissing) {
    return requiredMessages[input.name] ?? 'Заполните поле';
  }
  if (input.validity.typeMismatch && input.type === 'email') {
    return 'Введите корректный e-mail';
  }
  if (input.name === 'password' && input.value.length < PASSWORD_MIN_LENGTH) {
    return `Пароль должен содержать не менее ${PASSWORD_MIN_LENGTH} символов`;
  }
  return input.validity.valid ? '' : 'Проверьте значение поля';
};

export const useFormValidation = (): FormValidation => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateField = (event: SyntheticEvent<HTMLFormElement>): void => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const { name } = input;
    const error = getFieldError(input);
    setErrors((previous) => ({ ...previous, [name]: error }));
  };

  const onInvalid = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    validateField(event);
  };

  const onChange = (event: SyntheticEvent<HTMLFormElement>): void => {
    if (event.target instanceof HTMLInputElement && errors[event.target.name]) {
      validateField(event);
    }
  };

  return { errors, onInvalid, onBlur: validateField, onChange };
};
