import { LogoThemeDark, LogoThemeLight } from "assets/icons";

const components = {
  LogoThemeDark,
  LogoThemeLight,
};

const Icon = ({
  component,
  ...props
}: {
  component: keyof typeof components;
  title?: string;
  [x: string]: any;
}) => {
  const IconName = components[component];
  return <IconName {...props} />;
};

export default Icon;
