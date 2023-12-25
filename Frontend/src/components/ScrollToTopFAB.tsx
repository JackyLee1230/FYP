import { Box, Fab, Zoom, useScrollTrigger } from "@mui/material"
import { useCallback } from "react"
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp"

function ScrollToTopFab() {
  const trigger = useScrollTrigger({
    threshold: 200,
  })

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <Zoom in={trigger}>
      <Box
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 10,
        }}
      >
        <Fab
          onClick={scrollToTop}
          color="primary"
          size="medium"
        >
          <KeyboardArrowUp sx={{fontSize: "32px"}} />
        </Fab>
      </Box>
    </Zoom>
  )
}

export default ScrollToTopFab