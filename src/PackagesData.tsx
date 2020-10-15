import untypedPackagesData from './packages.json';
import untypedSizesData from './sizes.json';

export interface Package {
    name:string;
    code?:string[];
    dependencies?:string[];
    required?:boolean;
    rendererPlugin?:[string, string];
    canvasPlugin?:[string, string];
    appPlugin?:string;
    loaderPlugins?:string[];
    namespace?:string;
    filter?:string[];
    importOnly?:boolean;
    size:number;
}
export interface PackageGroup {
    packages:string[];
    title:string;
}

export interface PackagesData {
    packages:Package[];
    order:string[];
    groups:PackageGroup[];
}

const packagesData = untypedPackagesData as PackagesData;
const packagesMap:{[name:string]:Package} = {};

// Create the map of packages by name to make for easier look-up
packagesData.packages.forEach(pkg => {
    packagesMap[pkg.name] = pkg;
    pkg.size = untypedSizesData[pkg.name];
});

const defaultPackages = packagesData.packages
    .filter(pkg => pkg.required)
    .map(pkg => pkg.name);

export { packagesData, packagesMap, defaultPackages };
