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
 * Generate code for renderer plugins
 */
function rendererHTMLPlugin(rendererName:string, {name, rendererPlugin, canvasPlugin, namespace}:Package) {
    const target = rendererPlugin || canvasPlugin;
    const [apiName, className] = target;
    namespace = namespace ? `${namespace}.` : '';
    return `PIXI.${rendererName}.registerPlugin('${apiName}', PIXI.${namespace}${className});`;
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
        lines.push('import { Application } from \'@pixi/app\'');
        appPlugins.forEach(pkg => lines.push(`Application.registerPlugin(${pkg.appPlugin})`));
    }

    if (packages.includes('@pixi/loaders') && loaderPlugins.length) {
        lines.push('', '// Loader plugins');
        lines.push('import { Loader } from \'@pixi/loaders\'');
        loaderPlugins.forEach(pkg => lines.push(`Loader.registerPlugin(${pkg.loaderPlugin})`));
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

/**
 * Generate the HTML code
 */
export function createHTMLCode(packages:string[]) {
    const lines = packagesData.order
        .filter(name => packages.includes(name))
        .map(name => {
            const [ns, n] = name.split('/');
            return `<script src="https://pixijs.download/dev/packages/${n}.min.js"></script>`;
        });

    const loaderPlugins = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.loaderPlugin);
    const appPlugins = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.appPlugin);
    const filters = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.filter);
    const canvasPlugins = packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.canvasPlugin);

    lines.push('<script>');
    const TAB = '  ';
    packagesData.packages
        .filter(pkg => packages.includes(pkg.name) && !!pkg.rendererPlugin)
        .forEach(pkg => lines.push(TAB + rendererHTMLPlugin('Renderer', pkg)));

    if (packages.includes('@pixi/canvas-renderer') && canvasPlugins.length) {
        canvasPlugins.forEach(pkg => lines.push(TAB + rendererHTMLPlugin('CanvasRenderer', pkg)));
    }

    if (packages.includes('@pixi/app') && appPlugins.length) {
        appPlugins.forEach(pkg => lines.push(TAB + `PIXI.Application.registerPlugin(PIXI.${pkg.appPlugin});`));
    }

    if (packages.includes('@pixi/loaders') && loaderPlugins.length) {
        loaderPlugins.forEach(pkg => lines.push(TAB + `PIXI.Loader.registerPlugin(PIXI.${pkg.loaderPlugin});`));
    }

    lines.push('</script>');
    return lines.join('\n');
}
