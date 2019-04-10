import {Package, packagesData, packagesMap} from './PackagesData';
    
/**
 * Get header code
 */
function getCode({ name, namespace, code, importOnly }:Package) {
    if (importOnly) {
        return [`import '${name}'`];
    }
    else if (code) {
        return code.map(line => line.replace('${name}', name));
    }
    return namespace ? [
            `import * as ${namespace} from '${name}'`,
            `export { ${namespace} }`
        ] :
        [`export * from '${name}'`];
}

/**
 * Generate code for renderer plugins
 */
function rendererPlugin(rendererName:string, {name, rendererPlugin, canvasPlugin, namespace}:Package) {
    const target = rendererPlugin || canvasPlugin;
    const [apiName, className] = target;
    if (namespace) {
        return [
            `${rendererName}.registerPlugin('${apiName}', ${namespace}.${className})`
        ];
    }
    else {
        return [
            `import { ${className} } from '${name}'`,
            `${rendererName}.registerPlugin('${apiName}', ${className})`
        ];
    }
}

/**
 * Generate code for application plugins
 */
function appPlugin({name, appPlugin}:Package) {
    return [`Application.registerPlugin(${appPlugin})`];
}

/**
 * Generate code for loader plugins
 */
function loaderPlugin({name, loaderPlugin}:Package) {
    return [`Loader.registerPlugin(${loaderPlugin})`];
}

/**
 * Generate the ES6 code
 */
export function createBundleCode(packages:string[]) {
    const lines:string[] = [];

    const loaderPlugins = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.loaderPlugin);
    const appPlugins = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.appPlugin);
    const filters = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.filter);
    const canvasPlugins = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.canvasPlugin);

    packagesData.order
        .filter(name => packages.includes(name) && !packagesMap[name].filter)
        .map(name => packagesMap[name])
        .forEach(pkg => lines.push.apply(lines, getCode(pkg)));

    lines.push('', '// Renderer plugins');
    lines.push('import { Renderer } from \'@pixi/core\'');

    packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.rendererPlugin)
        .forEach(pkg => lines.push.apply(lines, rendererPlugin('Renderer', pkg)));

    if (packages.includes('@pixi/canvas-renderer') && canvasPlugins.length) {
        lines.push('', '// CanvasRenderer plugins');
        lines.push('import { CanvasRenderer } from \'@pixi/canvas-renderer\'');
        canvasPlugins.forEach(pkg => lines.push.apply(lines, rendererPlugin('CanvasRenderer', pkg)));
    }

    if (packages.includes('@pixi/app') && appPlugins.length) {
        lines.push('', '// Application plugins');
        appPlugins.forEach(pkg => lines.push.apply(lines, appPlugin(pkg)));
    }

    if (packages.includes('@pixi/loaders') && loaderPlugins.length) {
        lines.push('', '// Loader plugins');
        loaderPlugins.forEach(pkg => lines.push.apply(lines, loaderPlugin(pkg)));
    }

    if (filters.length) {
        lines.push('', '// Filters');
        const filterNames:string[] = [];
        filters.forEach(pkg => {
            const imports = pkg.filter.join(', ');
            filterNames.push(imports);
            lines.push(`import { ${imports} } from '${pkg.name}' }`);
        });
        lines.push(`export const filters = {\n  ${filterNames.join(',\n  ')}\n}`);
    }

    return lines
        .map(line => line && !line.startsWith('//') ? `${line};` : line)
        .join('\n');
}
