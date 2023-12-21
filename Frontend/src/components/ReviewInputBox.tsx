import { Box, InputLabel, Card, CardContent, CardMedia, CircularProgress, FormControl, Menu, MenuItem, Select, SelectChangeEvent, Typography, circularProgressClasses, styled, Autocomplete, TextField, Slider, Grid, Switch, FormControlLabel, Button, Avatar, Toolbar, Tooltip, Checkbox } from "@mui/material";
import { useState } from "react";
import { CustomInput } from "./CustomInput";
import { getPlatform, PlatformList } from "@/type/gamePlatform";
import { MuiFileInput } from 'mui-file-input';
import { User } from "@/type/user";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import axios from "axios";
import { GameInfo } from "@/type/game";
import { useRouter } from "next/router";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CancelIcon from '@mui/icons-material/Cancel';

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type ReviewInputBoxProps = {
  user: User;
  game: GameInfo;
};

const scores = [
  {
    value: 0,
    label: "Unflavorable",
  },
  {
    value: 50,
    label: "Mixed",
  },
  {
    value: 75,
    label: "Flavorable",
  },
];

function ReviewInputBox({user, game}: ReviewInputBoxProps) {
  const router = useRouter();

  const [comment, setComment] = useState("");
  const [score, setScore] = useState<number>(-1);
  const [platform, setPlatform] = useState<string | null>(null);
  const [playTime, setplayTime] = useState<number>(-1);
  const [recommended, setRecommended] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [images, setImages] = useState<File[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleRecommendedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecommended(event.target.checked);
  };

  const handleIsSponsoredChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSponsored(event.target.checked);
  };

  const handleImageChange = (newFiles: File[] | File | undefined) => {
    let allow = true;

    // Limit the total number of files to 3
    if (newFiles instanceof File) {
      newFiles = [newFiles];
    }
    if (newFiles && newFiles.length > 3) {
      displaySnackbarVariant(
        `You can only upload 3 images for your reivew.`,
        "error"
      );
      allow = false;
    }
    // Calculate the total size of the files
    let totalSize = 0;
    if (newFiles) {
      newFiles.forEach((file) => {
        totalSize += file.size;
      });
    }
    // Limit the size of each file to 3MB (3 * 1024 * 1024 bytes)
    const maxFileSize = 3 * 1024 * 1024;
    if (newFiles) {
      newFiles.forEach((file) => {
        if (file.size > maxFileSize) {
          displaySnackbarVariant(
            `File size exceeds the limit of 3MB: ${file.name}`,
            "error"
          );
          allow = false;
        }
      });
    }
    if(allow)
      setImages(newFiles);
  };

  async function addReview() {
    const apiURL = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/addReview`;

    const body = {
      score: score,
      comment: comment,
      gameId: game?.id,
      platform: platform,
      reviewerId: user.id,
      recommended: recommended,
      isSponsored: isSponsored,
      playTime: playTime,
    };

    const response = await axios.post(
      apiURL,
      body,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
    return response.data;
  }

  async function uploadReviewImages(reviewId: number) {
    const apiURL = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/uploadReviewImages/${reviewId}`;
    const formData = new FormData();
    if(images){
      images.forEach((image) => {
        formData.append("files", image);
      });
    }
    const response = await axios.post(
      apiURL,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
    return response.data;
  }

  const handleReviewSubmit = () => {
    if(comment.trim() === "" || score < 0 || platform === null || playTime < 0){
      displaySnackbarVariant(
        `Please fill in all the  fields.`,
        "error"
      );
      return;
    }
    setLoading(true);
    addReview().then((data) => {
      if(data.id){
        const reviewId = data.id;
        displaySnackbarVariant(
          `Review added successfully.`,
          "success"
        );
        setComment("");
        setScore(-1);
        setPlatform(null);
        setplayTime(-1);
        setRecommended(false);
        setIsSponsored(false);
        setImages(undefined);
        uploadReviewImages(reviewId).then((data) => {
          router.push(`/review/${reviewId}`);
        }).catch((error) => {
          displaySnackbarVariant(
            error?.response?.data?.message ?? `Failed to upload review images.`,
            "error"
          );
          setLoading(false);
          router.push(`/review/${reviewId}`);
        }
        );
      }
      else{
        displaySnackbarVariant(
          data.message,
          "error"
        );
      }
      setLoading(false);
    }).catch((error) => {
      displaySnackbarVariant(
        error?.response?.data?.message ?? `Failed to add review.`,
        "error"
      );
      setLoading(false);
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        padding: "18px",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        alignSelf: "stretch",
        bgcolor: "background.paper",
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "2px",
          alignSelf: "stretch",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            width: "100%",
          }}
        >
          <Avatar
            alt="User Avatar"
            src={
              user?.iconUrl != null
                ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user?.iconUrl}`
                : "/static/images/avatar/1.jpg"
            }
            sx={{ width: 76, height: 76 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {user?.name ?? "Unknown User"}
          </Typography>

          <Box sx={{ width: 350, marginLeft: 6 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  value={score < 0 ? 50 : score}
                  onChange={(event: Event, newValue: number | number[]) => {
                    if(typeof newValue === 'number') {
                      setScore(newValue);
                    }
                  }}
                  step={1}
                  marks={scores}
                  valueLabelDisplay="auto"
                  color="secondary"
                />
              </Grid>
              <Grid item>
                <CustomInput
                  value={score < 0 ? "" : score}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if(Number(event.target.value) >= 0 && Number(event.target.value) <= 100) {
                      setScore(Number(event.target.value));
                    }
                    else if(Number(event.target.value) > 100){
                      setScore(100);
                    }
                    else{
                      setScore(-1);
                    }
                  }}
                  placeholder="Score"
                  sx={{
                    '& .MuiInputBase-input': {
                      width: "62px",
                      height: "19px",
                      bgcolor: "white",
                    },
                  }}
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
          </Box>

          <Tooltip title={"Please use this field to state whether you recommend this game to other player."}>
            <FormControlLabel 
              control={<Checkbox size="small" color="secondary" value={recommended} onChange={handleRecommendedChange}/>} 
              label="Recommended" 
              sx={{margin: 0}}
            />
          </Tooltip>
        </Box>
        <CustomInput 
          value={comment}
          placeholder="Write a review..."
          onChange={(e) => setComment(e.target.value)}
          multiline 
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              width: "100%",
              bgcolor: "white",
              resize: "vertical",
              minHeight: "160px",
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "2px",
              width: "100%",
            }}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <Autocomplete
                size="small"
                options={game?.platforms}
                sx={{
                  bgcolor: "white",
                }}
                renderInput={(params) => <TextField {...params} placeholder="Select a platform" />}
                ListboxProps={
                  {
                    style:{
                        maxHeight: '250px',
                        backgroundColor: 'white',
                    }
                  }
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    {getPlatform(option)}
                  </li>
                )}
                getOptionLabel={(option) => getPlatform(option)}
                value={platform}
                onChange={(_: any, newValue: string | null) => {
                  setPlatform(newValue);
                }}
              />
            </FormControl>

            <CustomInput 
              value={playTime === -1 ? "" : playTime}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setplayTime(value > 0 ? value : 0);
              }}
              placeholder="Play Time (Minutes)"
              sx={{
                '& .MuiInputBase-input': {
                  width: "166px",
                  height: "19px",
                  bgcolor: "white",
                },
              }}
              type="number"
            />

            <Tooltip title="Upload images">        
              <MuiFileInput 
                multiple 
                size="small"
                value={images} 
                onChange={handleImageChange} 
                InputProps={{
                  inputProps: {
                    accept: '.png, .jpeg, .jpg'
                  },
                  startAdornment: <InsertPhotoIcon />
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: "white",
                    width: "220px",
                  },
                }}
                clearIconButtonProps={{
                  title: "Remove all images",
                  children: <CancelIcon color="primary" fontSize="small" />
                }}
              />
            </Tooltip>

            <Tooltip title={"Please use this field to state whether you received this game for free."}>
              <FormControlLabel 
                control={<Checkbox size="small" color="secondary" value={isSponsored} onChange={handleIsSponsoredChange}/>} 
                label="Sponsored" 
                sx={{margin: 0}}
              />
            </Tooltip>
          </Box>

          {/* <MuiFileInput multiple value={images} onChange={handleImageChange} inputProps={{ accept: '.png, .jpeg' }}  /> */}
          <Box sx={{ position: "relative" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReviewSubmit}
              disabled={loading}
            >
              Confirm
            </Button>
            {loading && (
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
        </Box>
      </Box>
    </Box>
  );
}

export default ReviewInputBox;

