import colors from './colors';
import typography from './typography';
import spacing from './spacing';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
}

const theme: Theme = {
  colors,
  typography,
  spacing,
};

export default theme;
