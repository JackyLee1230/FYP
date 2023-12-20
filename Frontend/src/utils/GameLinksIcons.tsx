import { ButtonBase, Tooltip } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export const getStoreIcons = (url: string) => {
  let urlArray = url.split(";");
  let returnedComponent = <div style={{ display: "flex", flex: "row" }}></div>;

  urlArray.forEach((url) => {
    if (url.includes("store.steampowered.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <ButtonBase
            href={url}
            style={{ marginRight: "18px" }}
            rel="noopener noreferrer"
            target="_blank"
            LinkComponent={Link}
            sx={{ borderRadius: 2 }}
          >
            <Tooltip title="Steam Store">
              <Image
                alt="steam icon"
                src="/steam.png"
                height={32}
                width={32}
              />
            </Tooltip>
          </ButtonBase>
        </>
      );
    }
    if (url.includes("store.playstation.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <ButtonBase
            href={url}
            style={{ marginRight: "18px" }}
            rel="noopener noreferrer"
            target="_blank"
            LinkComponent={Link}
            sx={{ borderRadius: 2 }}
          >
            <Tooltip title="Playstation Store">
              <Image
                alt="playstation icon"
                src="/playstation.png"
                height={32}
                width={32}
              ></Image>
            </Tooltip>
          </ButtonBase>
        </>
      );
    }

    if (url.includes("epicgames.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <ButtonBase
            href={url}
            style={{ marginRight: "18px" }}
            rel="noopener noreferrer"
            target="_blank"
            LinkComponent={Link}
            sx={{ borderRadius: 2 }}
          >
            <Tooltip title="Epic Games Store">
              <Image
                alt="epic games icon"
                src="/epicgames.png"
                height={32}
                width={32}
              ></Image>
            </Tooltip>
          </ButtonBase>
        </>
      );
    }

    if (url.includes("gog.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <ButtonBase
            href={url}
            style={{ marginRight: "18px" }}
            rel="noopener noreferrer"
            target="_blank"
            LinkComponent={Link}
            sx={{ borderRadius: 2 }}
          >
            <Tooltip title="GOG Store">
              <Image
                alt="gog icon"
                src="/gog.png"
                height={32}
                width={32}
              ></Image>
            </Tooltip>
          </ButtonBase>
        </>
      );
    }

    if (url.includes("xbox.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <ButtonBase
            href={url}
            style={{ marginRight: "18px" }}
            rel="noopener noreferrer"
            target="_blank"
            LinkComponent={Link}
            sx={{ borderRadius: 2 }}
          >
            <Tooltip title="XBOX Store">
              <Image
                alt="xbox icon"
                src="/xbox.png"
                height={32}
                width={32}
              ></Image>
            </Tooltip>
          </ButtonBase>
        </>
      );
    }

    if (url.includes("store.nintendo.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <ButtonBase
            href={url}
            style={{ marginRight: "18px" }}
            rel="noopener noreferrer"
            target="_blank"
            LinkComponent={Link}
            sx={{ borderRadius: 2 }}
          >
            <Tooltip title="Nintendo eShop">
              <Image
                alt="nintendo eshop icon"
                src="/nintendo.png"
                height={32}
                width={32}
              ></Image>
            </Tooltip>
          </ButtonBase>
        </>
      );
    }
  });

  return returnedComponent;
};

