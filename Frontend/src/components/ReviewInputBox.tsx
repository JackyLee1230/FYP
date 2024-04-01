import { Box, CircularProgress, FormControl, Typography, Autocomplete, TextField, Slider, Grid, FormControlLabel, Button, Avatar, Tooltip, Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomInput } from "./CustomInput";
import { getPlatform } from "@/type/gamePlatform";
import { MuiFileInput } from 'mui-file-input';
import { User } from "@/type/user";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import axios from "axios";
import { GameInfo, GameReview } from "@/type/game";
import { useRouter } from "next/router";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuthContext } from "@/context/AuthContext";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type ReviewInputBoxProps = {
  user: User;
  game: GameInfo;
  size?: "small" | "normal";
  review?: GameReview;
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

const scoresNoLabel = [
  {
    value: 0,
  },
  {
    value: 50,
  },
  {
    value: 75,
  },
];

function ReviewInputBox({user, game, size="normal", review}: ReviewInputBoxProps) {
  const router = useRouter();

  const [comment, setComment] = useState("");
  const [score, setScore] = useState<number>(-1);
  const [platform, setPlatform] = useState<string | null>(game?.platforms?.length === 1 ? game?.platforms[0] : null);
  const [playTime, setplayTime] = useState<number | string>(-1);
  const [recommended, setRecommended] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [images, setImages] = useState<File[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const auth = useAuthContext();

  const handleRecommendedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecommended(event.target.checked);
  };

  const handleIsSponsoredChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSponsored(event.target.checked);
  };

  const handleImageChange = (newFiles: File[] | File | undefined) => {
    let allow = true;

    // Limit the total number of files to 10
    if (newFiles instanceof File) {
      newFiles = [newFiles];
    }
    if (newFiles && newFiles.length > 10) {
      displaySnackbarVariant(
        `You can only upload 10 images for your reivew.`,
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

  useEffect(() => {
    if(review){
      setComment(review.comment);
      setScore(review.score);
      setPlatform(review.platform);
      setplayTime(review.playTime);
      setRecommended(review.recommended);
      setIsSponsored(review.sponsored);
    }
  }, [review]);

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

  async function editReview() {
    const apiURL = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/editReview/${review?.id}`;

    const body = {
      score: score,
      comment: comment,
      recommended: recommended,
      isSponsored: isSponsored,
      playTime: playTime,
    };

    const response = await axios.post(
      apiURL,
      body,
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
    return response.data;
  }

  async function uploadReviewImages(reviewId: number) {
    if(!images){
      return;
    }

    const apiURL = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/uploadReviewImages/${reviewId}`;
    const formData = new FormData();

    images.forEach((image) => {
      formData.append("files", image);
    });

    const response = await axios.post(
      apiURL,
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
    return response.data;
  }
  
  const handleReviewSubmit = () => {
    if(comment.trim() === "" || score < 0 || (platform === null && game?.platforms && game?.platforms.length > 0) || (typeof playTime != "number" || playTime < 0)){
      displaySnackbarVariant(
        `Please fill in all the fields.`,
        "error"
      );
      return;
    }
    setLoading(true);
    if(!review){
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
          if(images){
            uploadReviewImages(reviewId).then((data) => {
              setImages(undefined);
              router.push(`/reviews/${reviewId}`);
            }).catch((error) => {
              displaySnackbarVariant(
                error?.response?.data?.message ?? `Failed to upload review images.`,
                "error"
              );
              setLoading(false);
              router.push(`/reviews/${reviewId}`);
            }
            );
          }
          else{
            router.push(`/reviews/${reviewId}`);
          }
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
    else{
      editReview().then((data) => {
        if(data.id){
          const reviewId = data.id;
          displaySnackbarVariant(
            `Review edited successfully.`,
            "success"
          );
          review = data;
          router.push(`/reviews/${reviewId}`);
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
          error?.response?.data?.message ?? `Failed to edit review.`,
          "error"
        );
        setLoading(false);
      });
    }
  }

  if(size === "normal"){
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
          overflow: "hidden",
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
              alt={user?.name ?? "Unknown User"}
              src={
                user?.iconUrl != null
                  ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user?.iconUrl}`
                  : undefined
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
                control={<Checkbox size="small" color="secondary" onChange={handleRecommendedChange}/>} 
                checked={recommended}
                label="Recommended" 
                sx={{margin: 0}}
              />
            </Tooltip>
          </Box>
          <Box sx={{position: "relative", width: "100%"}}>
            <CustomInput 
              value={comment}
              placeholder="Write a review..."
              onChange={(e) => setComment(e.target.value)}
              multiline 
              fullWidth
              inputProps={{ maxLength: 10000 }}
              sx={{
                '& .MuiInputBase-input': {
                  width: "100%",
                  bgcolor: "white",
                  resize: "vertical",
                  minHeight: "160px",
                },
              }}
            />
            <Box sx={{position: "absolute", right: "8px", bottom: "0px"}}>
              <Typography variant="overline" color="text.secondary">
                {comment.length}/10000
              </Typography>
            </Box>
          </Box>
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
              {game?.platforms && game?.platforms?.length > 0 && (
                <FormControl sx={{ minWidth: 200 }}>
                  <Autocomplete
                    disabled={!!review}
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
              )}
  
              <CustomInput 
                value={playTime === -1 ? "" : playTime}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setplayTime(value > 0 ? value : "");
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
                  disabled={!!review}
                  multiple 
                  size="small"
                  value={images} 
                  onChange={handleImageChange} 
                  InputProps={{
                    inputProps: {
                      accept: '.png, .jpeg, .jpg'
                    },
                    startAdornment: <InsertPhotoIcon color={!!review ? "disabled" : "inherit"} />
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
                  control={<Checkbox size="small" color="secondary" onChange={handleIsSponsoredChange}/>} 
                  checked={isSponsored}
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
  else{
    return (
      <Box
        sx={{
          display: "flex",
          padding: "12px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          alignSelf: "stretch",
          bgcolor: "background.paper",
          borderRadius: "4px",
          overflow: "hidden",
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
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                wordBreak: "break-all",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "4px",
                  minWidth: 52
                }}
              >
                <Avatar
                  alt={user?.name ?? "Unknown User"}
                  src={
                    user?.iconUrl != null
                      ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user?.iconUrl}`
                      : undefined
                  }
                  sx={{ width: 52, height: 52 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                  {user?.name ?? "Unknown User"}
                </Typography>
              </Box>
  
              <Tooltip title={"Please use this field to state whether you recommend this game to other player."}>
                <FormControlLabel 
                  control={<Checkbox size="small" color="secondary" onChange={handleRecommendedChange}/>} 
                  checked={recommended}
                  label="Recommended" 
                  sx={{margin: 0}}
                />
              </Tooltip>
            </Box>
  
            <Box sx={{ width: "100%", justifyContent: "flex-end", display:"flex" }}>
              <Grid container spacing={2} alignItems="center">
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
                <Grid item xs>
                  <Slider
                    value={score < 0 ? 50 : score}
                    onChange={(event: Event, newValue: number | number[]) => {
                      if(typeof newValue === 'number') {
                        setScore(newValue);
                      }
                    }}
                    step={1}
                    marks={scoresNoLabel}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => 
                      value >= 75 ? "Flavorable" : value >= 50 ? "Mixed" : "Unflavorable"
                    }
                    color="secondary"
                  />
                </Grid>
              </Grid>
            </Box>
  
          </Box>
          <Box sx={{position: "relative", width: "100%"}}>
            <CustomInput 
              value={comment}
              placeholder="Write a review..."
              onChange={(e) => setComment(e.target.value)}
              multiline 
              fullWidth
              inputProps={{ maxLength: 10000 }}
              sx={{
                '& .MuiInputBase-input': {
                  width: "100%",
                  bgcolor: "white",
                  resize: "vertical",
                  minHeight: "220px",
                },
              }}
            />
            <Box sx={{position: "absolute", right: "8px", bottom: "0px"}}>
              <Typography variant="overline" color="text.secondary">
                {comment.length}/10000
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
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
              {game?.platforms && game?.platforms?.length > 0 && (
                <FormControl sx={{ width: "100%"}}>
                  <Autocomplete
                    disabled={!!review}
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
              )}
  
              <CustomInput 
                value={playTime === -1 ? "" : playTime}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setplayTime(value > 0 ? value : "");
                }}
                placeholder="Play Time (Minutes)"
                sx={{
                  width: "100%",
                  '& .MuiInputBase-input': {
                    width: "100%",
                    height: "19px",
                    bgcolor: "white",
                  },
                }}
                type="number"
              />
            </Box>
  
            <Box
              sx={(theme) => ({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
                width: "100%",

                [theme.breakpoints.down("sm")]: {
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: "0px",
                },
              })}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <Tooltip title="Upload images">        
                  <MuiFileInput 
                    disabled={!!review}
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
                        width: "100%",
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
                    control={<Checkbox size="small" color="secondary" onChange={handleIsSponsoredChange}/>} 
                    checked={isSponsored}
                    label="Sponsored" 
                    sx={{margin: 0}}
                  />
                </Tooltip>
              </Box>
  
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
      </Box>
    );
  }
}

export default ReviewInputBox;

