import './style.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
export {createMap} from './map';

export const setupUI = () => {
  hljs.highlightAll();
};
