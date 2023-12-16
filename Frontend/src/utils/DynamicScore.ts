export const getScoreColor = (percentile: number) => {
  {/*
    0-24: Error
    25-74: Warning
    75-100: Success 
  */}

  switch(true) {
    case percentile >= 75:
      return 'success';
    case percentile >= 25:
      return 'warning';
    default:
      return 'error';
  }
};