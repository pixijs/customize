const fs = require('fs');
const path = require('path');

let rootFolder;
if (process.env.PIXIJS) {
    // Use environment variable for getting path to pixi.js
    rootFolder = path.resolve(process.env.PIXIJS);
}
else {
    // Default check folder alongsize
    rootFolder = path.join(__dirname, '..', '..', 'pixi.js');
}
process.cwd(rootFolder);
module.paths.splice(0, 0, path.join(rootFolder, 'node_modules'));

const batchPackages = require('@lerna/batch-packages');
const filterPackages = require('@lerna/filter-packages');
const { getPackages } = require('@lerna/project');
const chalk = require('chalk');

async function getSortedPackages() {
    const packages = await getPackages(rootFolder);
    const filtered = filterPackages(packages, "@pixi/*", null, false);
    return batchPackages(filtered)
        .reduce((arr, batch) => arr.concat(batch), []);
}

(async function() {
    const packages = await getSortedPackages();
    const sizes = {};
    packages.forEach(pkg => {
        const {name, location} = pkg;
        const {bundle} = pkg.toJSON();
        const output = path.join(location, bundle.replace(/\.js$/, '.min.js'));
        if (!fs.existsSync(output)) {
            console.log(chalk.red('ERROR: Run "npm run build:prod" first.'));
            process.exit();
        }
        const {size} = fs.statSync(output);
        sizes[name] = size;
    });
    console.log(JSON.stringify(sizes, null, 4));
})();

