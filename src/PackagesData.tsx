import untypedPackagesData from './packages.json';

export interface Package {
    name:string;
    code?:string[];
    required?:boolean;
    rendererPlugin?:[string, string];
    appPlugin?:string;
    loaderPlugin?:string;
    namespace?:string;
    filter?:boolean;
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
packagesData.packages.forEach(pkg => packagesMap[pkg.name] = pkg);

const defaultPackages = packagesData.packages
    .filter(pkg => pkg.required)
    .map(pkg => pkg.name);

export { packagesData, packagesMap, defaultPackages };
