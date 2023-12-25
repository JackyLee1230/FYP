import {  ButtonBase, styled } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';

type CustomArrow = {
  size?: "small" | "medium" | "large";
  className?: any;
  style?: any;
  onClick?: any;
};

export function CustomArrowLeft({size="medium", className, style, onClick}: CustomArrow) {
  const theme = useTheme();

  const StyledChevronLeftIcon = styled(ChevronLeftIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: size === "small" ? 12 : size === "medium" ? 24 : 32,
  }));

  return (
    <ButtonBase
      style={{
        ...style,
        position: "absolute",
        zIndex: 10,
        opacity: 0.8,
        left: "-6%",
        transform: "translate(0, -50%)",
        top: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size === "small" ? 24 : size === "medium" ? 48 : 64,
        height: size === "small" ? 24 : size === "medium" ? 48 : 64,
        borderRadius: "50%",
        borderColor: theme.palette.primary.main,
        border: size === "small" ? "1px solid" : "2px solid",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        backgroundColor: "white",
      }}
      onClick={onClick}
    >
      <StyledChevronLeftIcon />
    </ButtonBase>
  );
}

export function CustomArrowRight({size="medium", className, style, onClick}: CustomArrow) {
  const theme = useTheme();

  const StyledChevronRightIcon = styled(ChevronRightIcon)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: size === "small" ? 12 : size === "medium" ? 24 : 32,
  }));

  return (
    <ButtonBase
      style={{
        ...style,
        position: "absolute",
        zIndex: 10,
        opacity: 0.8,
        right: "-6%",
        transform: "translate(0, -50%)",
        top: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size === "small" ? 24 : size === "medium" ? 48 : 64,
        height: size === "small" ? 24 : size === "medium" ? 48 : 64,
        borderRadius: "50%",
        borderColor: theme.palette.primary.main,
        border: size === "small" ? "1px solid" : "2px solid",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        backgroundColor: "white",
      }}
      onClick={onClick}
    >
      <StyledChevronRightIcon />
    </ButtonBase>
  );
}
