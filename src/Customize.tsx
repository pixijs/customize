import { h, Component } from 'preact';
import logoUrl from './images/logo.svg';
import packagesData from './packages.json';
import bind from 'bind-decorator';

interface Package {
    name:string;
    required?:boolean;
}
interface PackageGroup {
    packages:Package[];
    title:string;
}

interface State {
    packages:string[];
    useYarn:boolean;
}

/**
 * Main application
 */
export class Customize extends Component<any, State> {
    constructor() {
        super();

        // Get packages that are non-optional
        const defaultPackages:string[] = [];
        packagesData.forEach((group:PackageGroup) => {
            group.packages
            .filter((pkg:Package) => pkg.required)
            .forEach((pkg:Package) => {
                defaultPackages.push(pkg.name);
            });
        });

        const state:State = {
            packages: defaultPackages,
            useYarn: !!localStorage.getItem('useYarn')
        };

        // Check for saved packages
        const savedPackages = localStorage.getItem('packages');
        if (savedPackages) {
            state.packages = JSON.parse(savedPackages);
        }

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
        this.setState({ packages });
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

    render(props:any, { packages, useYarn }:State) {
        return (<div class="container py-4">
            <header class="mb-2">
                <h1><img src={logoUrl} class="logo" alt="PixiJS" /> Customize</h1>
            </header>
            <p>Select packages to include in a custom version of PixiJS. This will
            setup all the necessary plugin hooks for different packages. Visit the
            <a href="https://github.com/pixijs/pixi.js"> GitHub</a> project for more
            about PixiJS.</p>
            <div class="row">
                <div class="col-sm-4 col-md-3">
                    { packagesData.map((group:PackageGroup) => {
                        return <div class="mb-4">
                            <h2>{group.title}</h2>
                            <ul class="customize-list-group">
                                { group.packages.map((pkg:Package) => {
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
                <div class="col-sm-4 col-md-6">
                    <h2>PIXI Export <small class="text-secondary float-right">pixi-custom.js</small></h2>
                    <code class="customize-code mb-4">
                        { packages.map(name => <span>{`export * from '${name}';`}<br /></span>) }
                    </code>
                    <h2>PIXI Import<small class="text-secondary float-right">index.js</small></h2>
                    <code class="customize-code">
                        import * as PIXI from './pixi-custom.js';
                    </code>
                </div>
                <div class="col-sm-4 col-md-3">
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
