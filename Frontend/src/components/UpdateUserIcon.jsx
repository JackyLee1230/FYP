import { useAuthContext } from "@/context/AuthContext";
import { Box, Button, Modal, Slider, Typography, IconButton, Tooltip } from "@mui/material";
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

const CropperModal = ({
  src,
  file,
  setFile,
  setSrc,
  modalOpen,
  setModalOpen,
  setPreview,
}) => {
  const [slideValue, setSlideValue] = useState(10);
  const cropRef = useRef(null);

  const handleSave = async () => {
    if (cropRef) {
      const dataUrl = cropRef.current.getImage().toDataURL();
      const result = await fetch(dataUrl);
      const blob = await result.blob();
      const fileName = file.name;
      setPreview(URL.createObjectURL(blob));
      setFile(new File([blob], fileName, { type: "image/*" }));
      setModalOpen(false);
    }
  };

  return (
    <Modal
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      open={modalOpen}
    >
      <Box
        sx={{
          width: "300px",
          height: "300px",
          display: "flex",
          flexFlow: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AvatarEditor
          ref={cropRef}
          image={src}
          style={{ width: "100%", height: "100%" }}
          border={50}
          borderRadius={150}
          color={[0, 0, 0, 0.72]}
          scale={slideValue / 10}
          rotate={0}
        />

        <Slider
          min={10}
          max={50}
          sx={{
            margin: "0 auto",
            width: "80%",
            color: "cyan",
          }}
          size="medium"
          defaultValue={slideValue}
          value={slideValue}
          onChange={(e) => setSlideValue(e.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            padding: "10px",
            border: "3px solid white",
            background: "black",
          }}
        >
          <Button
            size="small"
            sx={{ marginRight: "10px", color: "white", borderColor: "white" }}
            variant="outlined"
            onClick={() => {
              setFile(null);
              setModalOpen(false);
            }}
          >
            cancel
          </Button>
          <Button
            sx={{ background: "#5596e6" }}
            size="small"
            variant="contained"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const Cropper = ({ setUpdateIconOpen }) => {
  const [src, setSrc] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const auth = useAuthContext();

  const handleImgChange = (e) => {
    setFile(e);
    if(!!e){
      setSrc(URL.createObjectURL(e));
      console.debug(URL.createObjectURL(e));
      setModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (src) {
      const formData = new FormData();
      formData.append("file", file);
      axios
        .post(
          `http://localhost:8080/api/user/updateUserIcon/${auth.user.id}`,
          formData
        )
        .then((res) => {
          setUpdateIconOpen(false);
          displaySnackbarVariant("Icon updated successfully", "success");
        })
        .catch((err) => {
          displaySnackbarVariant("Failed to update user icon, please try again", "error");
        });
    }
  };

  return (
    <Box
      style={{
        width: "fit-content",
        background: "white", 
        borderRadius: "16px", 
        padding: "24px 36px", 
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <IconButton 
        size="large" 
        onClick={() => setUpdateIconOpen(false)} 
        sx={{
          position: "absolute",
          top: 24,
          right: 36,
        }}
      >
        <CloseRoundedIcon/>
      </IconButton>

      <DialogTitle>
        <Typography variant="h4" color="primary.main" sx={{fontWeight: 700}}>Change Your Profile Icon</Typography>
      </DialogTitle>
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
          <Typography variant="subtitle1" color="text.secondary">Click to select image</Typography>
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
            placeholder="Upload icon"
            size="medium"
            value={file} 
            onChange={handleImgChange} 
            InputProps={{
              inputProps: {
                accept: 'image/*'
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
            <Image
              src={
                preview || `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${auth.user?.iconUrl}` || "https://via.placeholder.com/200"
              }
              alt=""
              width="200"
              height="200"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            setUpdateIconOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            handleSave();
          }}
          disabled={!file}
        >
          Save
        </Button>
      </DialogActions>

      <CropperModal
          modalOpen={modalOpen}
          file={file}
          setFile={setFile}
          src={src}
          setPreview={setPreview}
          setModalOpen={setModalOpen}
          setSrc={setSrc}
        />
    </Box>
  );
};

export default Cropper;

