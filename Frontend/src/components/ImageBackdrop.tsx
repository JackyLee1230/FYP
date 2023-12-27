import { IconButton, Modal } from "@mui/material";
import Image from "next/image";
import CloseIcon from '@mui/icons-material/Close';


type ImageBackdropProp = {
  open: boolean;
  handleClose: () => void;
  imageUrl: string;
};

function ImageBackdrop({open, handleClose, imageUrl}: ImageBackdropProp) {
  return (
    <Modal
      sx={{  
        color: '#fff', 
        zIndex: (theme: any) => theme.zIndex.drawer + 1, 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey",
      }}
      open={open}
      onClick={handleClose}
    >
      <>
        <IconButton
          size="large"
          color="secondary"
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            margin: "8px",
            zIndex: 10,
          }}
        >
          <CloseIcon/>
        </IconButton>
        <Image
          src={imageUrl}
          width={0}
          height={0}
          sizes="100vw"
          style={{
            height: "auto",
            width: "100%",
            maxHeight: "94vh",
            maxWidth: "86vw",
            objectFit: "scale-down",
          }}
          alt={"review image"}
        />
      </>
    </Modal>
  );
}

export default ImageBackdrop;

