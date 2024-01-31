import { useAuthContext } from "@/context/AuthContext";
import { Box, Button, Modal, Slider } from "@mui/material";
import axios from "axios";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

const CropperModal = ({
  src,
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
      setPreview(URL.createObjectURL(blob));
      setFile(blob);
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
  const inputRef = useRef(null);

  const auth = useAuthContext();

  // handle Click
  const handleInputClick = (e) => {
    e.preventDefault();
    inputRef.current.click();
  };
  // handle Change
  const handleImgChange = (e) => {
    setSrc(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files[0]);
    console.debug(URL.createObjectURL(e.target.files[0]));
    setModalOpen(true);
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
        })
        .catch((err) => {
          console.error("failed to update user icon");
        });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        width: "fit-content",
        padding: "5%",
      }}
    >
      <header>
        <h1>Change Your Profile Icon!</h1>
        <hr />
      </header>
      <main className="container">
        <CropperModal
          modalOpen={modalOpen}
          setFile={setFile}
          src={src}
          setPreview={setPreview}
          setModalOpen={setModalOpen}
          setSrc={setSrc}
        />
        <small>Click to select image</small>
        <br />
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleImgChange}
        />
        <div className="img-container">
          <img
            src={
              preview ||
              " https://www.signivis.com/img/custom/avatars/member-avatar-01.png"
            }
            alt=""
            width="200"
            height="200"
          />
        </div>
        <Button
          variant="contained"
          onClick={() => {
            setUpdateIconOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleSave();
          }}
        >
          Save
        </Button>
      </main>
    </div>
  );
};

export default Cropper;

