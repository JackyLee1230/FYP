export const validateEmail = (email: string) => {
  if (!email) return true;
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/*
  Password Rules:

  at least 8 - 16 characters,
  must contain at least 1 letter and 1 number
*/
export const validatePassword = (password: string) => {
  if (!password) return true;
  return String(password).match(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/
  );
};

/*
  Password Rules:

  max 14 characters,
  cannot contain @ or space
*/
export const validateUsername = (username: string) => {
  if (!username) return true;
  return String(username).match(/^[^\s@]{4,14}$/);
};

