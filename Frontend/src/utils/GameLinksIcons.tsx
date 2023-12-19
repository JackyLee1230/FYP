export const getStoreIcons = (url: string) => {
  let urlArray = url.split(";");
  let returnedComponent = <div style={{ display: "flex", flex: "row" }}></div>;

  urlArray.forEach((url) => {
    if (url.includes("store.steampowered.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <a>STEAM</a>
          {"\t"}
        </>
      );
    }
    if (url.includes("store.playstation.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <a>PS</a>
          {"\t"}
        </>
      );
    }

    if (url.includes("epicgames.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <a>EPIC</a>
          {"\t"}
        </>
      );
    }

    if (url.includes("gog.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <a>GOG</a>
          {"\t"}
        </>
      );
    }

    if (url.includes("xbox.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <a>XBOX</a>
          {"\t"}
        </>
      );
    }

    if (url.includes("store.nintendo.com")) {
      returnedComponent = (
        <>
          {returnedComponent}
          <a>NINTENDO</a>
          {"\t"}
        </>
      );
    }
  });

  return returnedComponent;
};

