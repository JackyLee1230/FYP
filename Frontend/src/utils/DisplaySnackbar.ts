import { VariantType, enqueueSnackbar } from 'notistack';

export function displaySnackbar(message: string) {
  enqueueSnackbar(message);
};

export function displaySnackbarVariant(message: string, variant: VariantType) {
  // variant could be success, error, warning, info, or default
  enqueueSnackbar(message, { variant });
}



