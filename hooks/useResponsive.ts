import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    gridColumns: isDesktop ? 3 : isTablet ? 2 : 1,
  };
}