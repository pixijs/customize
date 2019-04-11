import { h, Component } from 'preact';
import logoUrl from './images/logo.svg';
import downloadUrl from './images/download.svg';
import bind from 'bind-decorator';
import { HighLight } from 'preact-highlight';
import { createBundleCode, createHTMLCode } from './CodeUtils';
import { packagesData, packagesMap, defaultPackages, Package, PackageGroup } from './PackagesData';

interface State {
    packages:string[];
    useYarn:boolean;
    useBrowser:boolean;
    bundleCode?:string;
    htmlCode?:string;
}

/**
 * Main application
 */
export class Customize extends Component<any, State> {
    constructor() {
        super();

        const state:State = {
            packages: defaultPackages,
            useYarn: !!localStorage.getItem('useYarn'),
            useBrowser: !!localStorage.getItem('useBrowser')
        };

        // Check for saved packages
        const savedPackages = localStorage.getItem('packages');
        if (savedPackages) {
            state.packages = JSON.parse(savedPackages);
        }
        state.bundleCode = createBundleCode(state.packages);
        state.htmlCode = createHTMLCode(state.packages);
        this.state = state;
    }

    /**
     * Toggle package selection
     */
    @bind
    private onTogglePackage(event:Event) {
        const {packages} = this.state;
        const {checked, dataset: {name}} = event.currentTarget as HTMLInputElement;
        if (checked) {
            packages.push(name);
        }
        else {
            packages.splice(packages.indexOf(name), 1);
        }
        this.refreshPackages(packages);
    }

    private onToggleGroup(group:PackageGroup, event:Event) {
        const {checked} = event.currentTarget as HTMLInputElement;
        const {packages} = this.state;
        if (checked) {
            group.packages
                .filter(name => !packagesMap[name].required)
                .filter(name => !packages.includes(name))
                .forEach(name => packages.push(name));
        }
        else {
            group.packages
                .filter(name => !packagesMap[name].required)
                .filter(name => packages.includes(name))
                .forEach(name => packages.splice(packages.indexOf(name), 1));
        }
        this.refreshPackages(packages);
    }

    /**
     * Regenerate the bundle source code
     */
    private refreshPackages(packages:string[]) {
        localStorage.setItem('packages', JSON.stringify(packages));
        this.setState({
            packages,
            bundleCode: createBundleCode(packages),
            htmlCode: createHTMLCode(packages)
        });
    }

    /**
     * Handle the use of yarn
     */
    private onYarn(useYarn:boolean) {
        if (useYarn) {
            localStorage.setItem('useYarn', '1');
        }
        else {
            localStorage.removeItem('useYarn');
        }
        this.setState({ useYarn });
    }

    /**
     * Handle browser type
     */
    private onBrowser(useBrowser:boolean) {
        if (useBrowser) {
            localStorage.setItem('useBrowser', '1');
        }
        else {
            localStorage.removeItem('useBrowser');
        }
        this.setState({ useBrowser });
    }

    private groupSelected(group:PackageGroup): boolean {
        for (const name of group.packages) {
            if (!this.state.packages.includes(name)) {
                return false;
            }
        }
        return true;
    }

    render(props:any, { packages, useYarn, useBrowser, bundleCode, htmlCode }:State) {
        return (<div class="app-container">
            <div class="app-header">
                <header class="mb-2">
                    <div class="btn-group m-2 float-right">
                        <button class={`btn btn-sm px-3 btn-${useBrowser ? 'primary' : 'outline-secondary'}`}
                            onClick={this.onBrowser.bind(this, true)}>Browser</button>
                        <button class={`btn btn-sm px-3 btn-${!useBrowser ? 'primary' : 'outline-secondary'}`}
                            onClick={this.onBrowser.bind(this, false)}>Bundler</button>
                    </div>
                    <h1><img src={logoUrl} class="logo" alt="PixiJS" /> Customize</h1>
                </header>
            </div>
            <div class="app-main row">
                <div class="app-col col-sm-4 col-md-3">
                    { packagesData.groups.map((group, i) => {
                        return <div class="customize-group">
                            <h2><div class="custom-control custom-checkbox">
                                <input type="checkbox"
                                    class="custom-control-input"
                                    id={`package_group${i}`}
                                    checked={this.groupSelected(group)}
                                    onChange={this.onToggleGroup.bind(this, group)} />
                                <label class="custom-control-label" for={`package_group${i}`}>{group.title}</label>
                            </div></h2>
                            <ul class="customize-list-group">
                                { group.packages.map(name => packagesMap[name]).map(pkg => {
                                    return <li class={`customize-list-group-item ${pkg.required ? 'disabled' : ''}`}>
                                        <div class="custom-control custom-checkbox">
                                            <input type="checkbox"
                                            class="custom-control-input"
                                            id={pkg.name}
                                            data-name={pkg.name}
                                            onChange={this.onTogglePackage}
                                            checked={packages.includes(pkg.name)} />
                                            <label class="custom-control-label" for={pkg.name}>{pkg.name}</label>
                                        </div>
                                    </li>;
                                })}
                            </ul>
                        </div>;
                    }) }
                </div>
                { !useBrowser && <div class="app-col app-col-main col-sm-4 col-md-6">
                    <h2>Bundle Code</h2>
                    <p>When using <a href="https://webpack.js.org/">Webpack</a>,
                    <a href="https://rollupjs.org"> Rollup</a> or
                    <a href="https://parceljs.org/"> Parcel</a> you can embed
                    the follow code in your project and then
                    simply <code>import * as PIXI from './pixi.js'</code>.</p>
                    <HighLight className="customize-code mb-2" code={bundleCode} language="javascript" />
                    <a download="pixi.js" href={`data:text/plain,${bundleCode}`}>
                        <button class="btn btn-primary btn-block float-right">
                            <img src={downloadUrl} class="mr-2" width="20" height="20" />
                            Download
                        </button>
                    </a>
                </div> }
                { !useBrowser && <div class="app-col col-sm-4 col-md-3">
                    <h2>Install</h2>
                    <div class="btn-group w-100 mb-2">
                        <button class={`btn btn-sm btn-${!useYarn ? 'primary' : 'outline-secondary'}`} onClick={this.onYarn.bind(this, false)}>npm</button>
                        <button class={`btn btn-sm btn-${useYarn ? 'primary' : 'outline-secondary'}`} onClick={this.onYarn.bind(this, true)}>yarn</button>
                    </div>
                    <code class="customize-code mb-4 small">
                        { useYarn ? 'yarn add' : 'npm install'} { packages.join(' ') }
                    </code>
                </div> }
                { useBrowser && <div class="app-col app-col-main col-sm-8 col-md-9">
                    <h2>Browser Code</h2>
                    <HighLight className="customize-code mb-2" code={htmlCode} language="html" />
                    <a download="pixi.html" href={`data:text/plain,${htmlCode}`}>
                        <button class="btn btn-primary btn-block float-right">
                            <img src={downloadUrl} class="mr-2" width="20" height="20" />
                            Download
                        </button>
                    </a>
                </div> }
            </div>
        </div>);
    }
}

class Code extends Component<any, any> {
    render(props:any) {
        return <span class="exports">{props.children}</span>;
    }
}
