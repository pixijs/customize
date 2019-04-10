import { h, Component } from 'preact';
import logoUrl from './images/logo.svg';
import bind from 'bind-decorator';
import { createBundleCode } from './CodeUtils';
import { packagesData, packagesMap, defaultPackages, Package } from './PackagesData';

interface State {
    packages:string[];
    useYarn:boolean;
    bundleCode?:string;
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
            bundleCode: ''
        };

        // Check for saved packages
        const savedPackages = localStorage.getItem('packages');
        if (savedPackages) {
            state.packages = JSON.parse(savedPackages);
        }
        state.bundleCode = createBundleCode(state.packages);
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
        localStorage.setItem('packages', JSON.stringify(packages));
        this.setState({ packages, bundleCode: createBundleCode(packages) });
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

    render(props:any, { packages, useYarn, bundleCode }:State) {
        return (<div class="app-container">
            <div class="app-header">
                <header class="mb-2">
                    <h1><img src={logoUrl} class="logo" alt="PixiJS" /> Customize</h1>
                </header>
                <p>Select packages to include in a custom version of PixiJS. This will
                setup all the necessary plugin hooks for different packages. Visit the
                <a href="https://github.com/pixijs/pixi.js"> GitHub</a> project for more
                about PixiJS.</p>
            </div>
            <div class="app-main row">
                <div class="app-col col-sm-4 col-md-3">
                    { packagesData.groups.map(group => {
                        return <div class="customize-group">
                            <h2>{group.title}</h2>
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
                <div class="app-col col-sm-4 col-md-6">
                    <h2>PIXI Export <small class="text-secondary float-right">pixi-custom.js</small></h2>
                    <code class="customize-code preformatted mb-4">{bundleCode}</code>
                    <h2>PIXI Import<small class="text-secondary float-right">index.js</small></h2>
                    <code class="customize-code">
                        import * as PIXI from './pixi-custom.js';
                    </code>
                </div>
                <div class="app-col col-sm-4 col-md-3">
                    <h2>Install</h2>
                    <div class="btn-group w-100 mb-2">
                        <button class={`btn btn-sm btn-${!useYarn ? 'primary' : 'outline-secondary'}`} onClick={this.onYarn.bind(this, false)}>npm</button>
                        <button class={`btn btn-sm btn-${useYarn ? 'primary' : 'outline-secondary'}`} onClick={this.onYarn.bind(this, true)}>yarn</button>
                    </div>
                    <code class="customize-code mb-4">
                        { useYarn ? 'yarn add' : 'npm install'} { packages.join(' ') }
                    </code>
                </div>
            </div>
        </div>);
    }
}

class Code extends Component<any, any> {
    render(props:any) {
        return <span class="exports">{props.children}</span>;
    }
}
