import { Modal } from "@mui/material";
import Image from "next/image";


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
      }}
      open={open}
      onClick={handleClose}
    >
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
    </Modal>
  );
}

export default ImageBackdrop;

