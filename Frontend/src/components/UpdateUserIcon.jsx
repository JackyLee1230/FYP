import { useAuthContext } from "@/context/AuthContext";
import {
  Box,
  Button,
  Modal,
  Slider,
  Typography,
  IconButton,
  alpha,
  CircularProgress,
  Avatar,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import axios from "axios";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Image from "next/image";
import { MuiFileInput } from "mui-file-input";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import CancelIcon from "@mui/icons-material/Cancel";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import router from "next/router";

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
          width: "50vw",
          maxWidth: "550px",
          minWidth: "325px",
          display: "flex",
          flexFlow: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
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
          }}
          color="secondary"
          size="medium"
          defaultValue={slideValue}
          value={slideValue}
          onChange={(e) => setSlideValue(e.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            padding: "8px 12px",
            gap: "12px",
            borderRadius: "8px",
            background: alpha("#000000", "0.4"),
          }}
        >
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              setFile(null);
              setModalOpen(false);
            }}
          >
            cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="info"
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
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthContext();

  console.log(
    preview
      ? preview
      : auth.user?.iconUrl
      ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${auth.user?.iconUrl}`
      : "https://via.placeholder.com/200"
  );

  const handleImgChange = (e) => {
    if (!e) {
      setFile(e);
      setPreview(null);
      setSrc(null);
      return;
    }

    if (e.type && e.type.startsWith("image/")) {
      const allowedExtensions = ["png", "jpeg", "jpg"];
      const fileExtension = e.name.split(".").pop().toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        setFile(e);
        setSrc(URL.createObjectURL(e));
        console.debug(URL.createObjectURL(e));
        setModalOpen(true);
      } else {
        displaySnackbarVariant(
          "Please select a .png, .jpeg, or .jpg file.",
          "error"
        );
      }
    } else {
      displaySnackbarVariant("Please select an image file.", "error");
    }
  };

  const handleSave = async () => {
    if (src) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      axios
        .post(
          `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/updateUserIcon/${auth.user.id}`,
          formData
        )
        .then((res) => {
          setUpdateIconOpen(false);
          displaySnackbarVariant("Icon updated successfully", "success");
          router.reload();
        })
        .catch((err) => {
          displaySnackbarVariant(
            "Failed to update user icon, please try again",
            "error"
          );
        })
        .finally(() => {
          setIsLoading(false);
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
        <CloseRoundedIcon />
      </IconButton>

      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
        Change Your Profile Icon
      </Typography>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "4px",
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Click to select image
        </Typography>
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
                accept: ".png, .jpeg, .jpg",
              },
              startAdornment: <InsertPhotoIcon />,
            }}
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "white",
                width: "250px",
              },
            }}
            clearIconButtonProps={{
              title: "Remove all images",
              children: <CancelIcon color="primary" fontSize="small" />,
            }}
          />
          <Avatar
            alt="Avatar icon preview"
            src={
              preview
                ? preview
                : auth.user?.iconUrl
                ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${auth.user?.iconUrl}`
                : "https://via.placeholder.com/200"
            }
            sx={{
              width: 200,
              height: 200,
            }}
          />
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
        <Box sx={{ m: 1, position: "relative" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              handleSave();
            }}
            disabled={!file || isLoading}
          >
            Save
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Box>
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

