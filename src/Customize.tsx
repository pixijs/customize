import { h, Component } from 'preact';
import logoUrl from './images/logo.svg';

export class Customize extends Component<any, any> {
    render() {
        return (<div class="container py-4">
            <header class="mb-2">
                <h1><img src={logoUrl} class="logo" alt="PixiJS" /> Customize</h1>
            </header>
            <p>Select packages to include in a custom version of PixiJS. This will
            setup all the necessary plugin hooks for different packages. Visit the
            <a href="https://github.com/pixijs/pixi.js"> GitHub</a> project for more
            about PixiJS.</p>
        </div>);
    }
}
