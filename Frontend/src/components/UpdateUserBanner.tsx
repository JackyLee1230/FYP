import { useAuthContext } from "@/context/AuthContext";
import { Box, Button, Modal, Slider, Typography, IconButton, alpha, CircularProgress, Avatar, useTheme, useMediaQuery } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import axios from "axios";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Image from "next/image";
import { MuiFileInput } from 'mui-file-input';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CancelIcon from '@mui/icons-material/Cancel';
import { displaySnackbarVariant } from '@/utils/DisplaySnackbar';
import router from "next/router";

type UpdateUserBannerBoxProps = {
  setUpdateBannerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};


const UpdateUserBannerBox = ({ setUpdateBannerOpen }: UpdateUserBannerBoxProps) => {
  const [banner, setBanner] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const auth = useAuthContext();

  const handleBannerSave = async () => {
    if (!banner) {
      displaySnackbarVariant("Please select a file to upload", "error");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", banner);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/updateUserBanner/${auth.user?.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
      if (response.status === 200) {
        displaySnackbarVariant("Your banner has been updated successfully", "success");
        setUpdateBannerOpen(false);
        router.reload();
      }
    } catch (error: any) {
      console.error(error);
      displaySnackbarVariant(error?.response?.data?.message || "Failed to update your banner, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const handleBannerUpload = (e: any) => {
    if(!e){
      setBanner(e);
      setPreview(null);
      return;
    }
  
    if (e.type && e.type.startsWith("image/")) {
      const allowedExtensions = ["png", "jpeg", "jpg"];
      const fileExtension = e.name.split(".").pop().toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        setBanner(e);
        setPreview(URL.createObjectURL(e));
      } else {
        displaySnackbarVariant("Please select a .png, .jpeg, or .jpg file.", "error");
      }
    } else {
      displaySnackbarVariant("Please select an image file.", "error");
    }
  };

  return (
    <Box
      sx={{
        width: "fit-content",
        background: "white", 
        borderRadius: "16px", 
        padding: "24px 36px", 
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        position: "relative",
        
        [theme.breakpoints.down("sm")]: {
          padding: "18px 24px",
          boxShadow: "none",
          width: "100%",
        }
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} color="primary.main" sx={{fontWeight: 700}}>Change Your Profile Banner</Typography>
        <IconButton 
          size="large" 
          onClick={() => setUpdateBannerOpen(false)} 
        >
          <CloseRoundedIcon/>
        </IconButton> 
      </Box>
      
      <DialogContent 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "4px",
        }}
      >
        <DialogContentText>
          <Typography variant={isMobile ? "subtitle2" : "subtitle1"} color="text.secondary">Click to select image</Typography>
        </DialogContentText>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <MuiFileInput 
            placeholder="Upload banner"
            size="medium"
            value={banner} 
            onChange={handleBannerUpload} 
            InputProps={{
              inputProps: {
                accept: '.png, .jpeg, .jpg'
              },
              startAdornment: <InsertPhotoIcon />
            }}
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: "white",
                width: "250px",
              },
            }}
            clearIconButtonProps={{
              title: "Remove all images",
              children: <CancelIcon color="primary" fontSize="small" />
            }}
          />
          <Box>
            <Avatar
              alt="User banner preview"
              src={
                preview ? preview : auth.user?.bannerUrl ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${auth.user?.bannerUrl}` : "https://via.placeholder.com/500x125"
              }
              variant="rounded"
              sx={{ 
                width: 500, 
                height: 125,
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={() => {
            setUpdateBannerOpen(false);
          }}
        >
          Cancel
        </Button>
        <Box sx={{ m: 1, position: 'relative' }}>
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            onClick={() => {
              handleBannerSave();
            }}
            disabled={!banner || isLoading}
          >
            Save
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>

    </Box>
  );
};

export default UpdateUserBannerBox;

