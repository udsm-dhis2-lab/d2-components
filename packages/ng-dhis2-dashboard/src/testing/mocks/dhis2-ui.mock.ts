const component = (name: string) => {
  const MockComponent = () => null;
  Object.defineProperty(MockComponent, 'name', { value: name });
  return MockComponent;
};

export const Button = component('Button');
export const CircularLoader = component('CircularLoader');
export const FlyoutMenu = component('FlyoutMenu');
export const Menu = component('Menu');
export const MenuItem = component('MenuItem');
export const Tab = component('Tab');
export const TabBar = component('TabBar');
export const IconChevronDown16 = component('IconChevronDown16');
export const IconChevronUp16 = component('IconChevronUp16');
export const IconClock16 = component('IconClock16');
export const IconDimensionOrgUnit16 = component('IconDimensionOrgUnit16');
export const IconDownload16 = component('IconDownload16');
export const IconFilter16 = component('IconFilter16');
export const IconFullscreen16 = component('IconFullscreen16');
export const IconFullscreenExit16 = component('IconFullscreenExit16');
export const IconVisualizationColumn16 = component(
  'IconVisualizationColumn16'
);
export const spacers = { dp8: '8px' };
