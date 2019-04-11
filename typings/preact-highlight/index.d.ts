declare module 'preact-highlight' {
    import { Component, ComponentChild } from 'preact';
    export interface HighLightProps {
        code:string;
        theme?:string;
        className?:string;
        language?:string;
    }
    export class HighLight extends Component<HighLightProps, any> {
        render(props?:HighLightProps, state?:any): ComponentChild;
    }
}
