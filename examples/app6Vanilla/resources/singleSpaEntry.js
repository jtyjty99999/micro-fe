
import {mainEnter} from './articleAnalysis/main';

let domEl;
export function bootstrap(props) {
    return Promise
        .resolve()
        .then(() => {
            domEl = document.createElement('div');
            domEl.id = 'app6';
            document.body.appendChild(domEl);
        });
}
export function mount(props) {
    return Promise
        .resolve()
        .then(() => {
			mainEnter.bizInit('app6');
            domEl.textContent = 'App 6 is mounted!'
            /* var link = document.createElement('link');
            link.href = './inner.css';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.getElementById('app6').appendChild(link); */
        });
} 
export function unmount(props) {
    return Promise
        .resolve()
        .then(() => {
			document.getElementById('app6').innerHTML = '';
		})

	}