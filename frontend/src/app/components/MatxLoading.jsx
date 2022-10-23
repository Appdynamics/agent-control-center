import { CircularProgress } from '@mui/material';
import { Box, styled } from '@mui/system';

const StyledLoading = styled('div')(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: 'auto',
    height: '50px',
  },
  '& .circleProgress': {
    position: 'absolute',
    left: -16,
    right: 0,
    top: 'calc(50% - 43px)',
  },
}));

const Loading = () => {
  return (
    <StyledLoading>
      <Box position="relative">
        <img src="/assets/images/logo/appd-icon.svg" alt="AppDynamics" />
        <CircularProgress className="circleProgress" size="80px" thickness={2}/>
      </Box>
    </StyledLoading>
  );
};

export default Loading;
