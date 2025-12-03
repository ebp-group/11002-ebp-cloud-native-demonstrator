import './style.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
export {createMap} from './map';

export const setupUI = () => {
  hljs.highlightAll();
  document.getElementById('clearResults')?.addEventListener('click', () => (document.getElementById('clickresult')!.innerHTML = 'none'));
};

export const setHighlightedResult = (content: unknown) => {
  const {value} = hljs.highlight(JSON.stringify(content, null, 2), {language: 'json'});
  document.getElementById('clickresult')!.innerHTML = value;
};
