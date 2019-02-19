/// <reference path='./index.d.ts'/>

import './styles/index.scss';
import { Customize } from './Customize';
import { render, h } from 'preact';

render(
    (<Customize />),
    document.body,
    document.body.lastElementChild
);
