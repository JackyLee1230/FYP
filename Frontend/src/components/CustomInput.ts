import { alpha, InputBase, styled } from "@mui/material";

export const CustomInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3),
  },
  "&.Mui-error .MuiInputBase-input": {
    border: "1px solid",
    borderColor: theme.palette.error.main
  },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    border: '1px solid',
    borderColor: theme.palette.divider,
    fontSize: 16,
    width: 325,
    maxWidth: "100%",
    padding: '10px 12px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:focus': {
      border: '2px solid',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}));