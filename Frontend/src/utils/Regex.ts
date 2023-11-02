export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};


/*
  Password Rules:

  At least 8 - 16 characters,
  must contain at least 1 letter and 1 number
*/
export const validatePassword = (password: string) => {
  return String(password)
    .match(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/
    );
};