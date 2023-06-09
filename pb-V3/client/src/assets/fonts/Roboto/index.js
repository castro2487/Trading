import SourceRobotoRegular from './Roboto-Regular.ttf';
import SourceRobotoBold from './Roboto-Bold.ttf';
import SourceRobotoMedium from './Roboto-Medium.ttf';
import SourceRobotoLight from './Roboto-Light.ttf';

const sourceRobotoLight = {
	fontFamily: 'Roboto',
	fontStyle: 'normal',
	fontDisplay: 'swap',
	fontWeight: 300,
	src: `
    local('Roboto'),
    local('Roboto-Light'),
    url(${SourceRobotoLight}) format('woff2')
    `,
};

const sourceRobotoRegular = {
	fontFamily: 'Roboto',
	fontStyle: 'normal',
	fontDisplay: 'swap',
	fontWeight: 400,
	src: `
    local('Roboto'),
    local('Roboto-Regular'),
    url(${SourceRobotoRegular}) format('woff2')
    `,
};

const sourceRobotoMedium = {
	fontFamily: 'Roboto',
	fontStyle: 'normal',
	fontDisplay: 'swap',
	fontWeight: 500,
	src: `
    local('Roboto'),
    local('Roboto-Medium'),
    url(${SourceRobotoMedium}) format('woff2')
    `,
};

const sourceRobotoBold = {
	fontFamily: 'Roboto',
	fontStyle: 'normal',
	fontDisplay: 'swap',
	fontWeight: 700,
	src: `
    local('Roboto'),
    local('Roboto-Bold'),
    url(${SourceRobotoBold}) format('woff2')
    `,
};

export { sourceRobotoRegular, sourceRobotoBold, sourceRobotoMedium, sourceRobotoLight };
