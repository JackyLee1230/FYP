import { Switch, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';


export const CustomPrivateSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.error.main,
      },
      color: theme.palette.error.main,
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 -960 960 960"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 0.75,
        backgroundColor: theme.palette.error.main,
      },
    },
    '&.Mui-disabled': {
      '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.grey[400],
      },
      '& + .MuiSwitch-track': {
        opacity: 0.75,
        backgroundColor: theme.palette.grey[400],
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.success.main,
    border: "1px solid",
    borderColor: theme.palette.background.paper,
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 -960 960 960"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M240-640h360v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85h-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640Zm0 480h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM240-160v-400 400Z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 0.75,
    backgroundColor: theme.palette.success.main,
    borderRadius: 20 / 2,
  },
}));