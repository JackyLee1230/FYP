export const getScoreColor = (percentile: number) => {
  {/*
    0-29: Error
    30-74: Warning
    75-100: Success 
  */}

  switch(true) {
    case percentile >= 75:
      return 'success';
    case percentile >= 30:
      return 'warning';
    default:
      return 'error';
  }
};


export const getReviewColor = (score: number) => {
  {/*
    0-49: Error
    50-74: Warning
    75-100: Success 
  */}

  switch(true) {
    case score >= 75:
      return 'success';
    case score >= 50:
      return 'warning';
    default:
      return 'error';
  }
};