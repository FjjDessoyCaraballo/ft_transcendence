import './styles/main.css';
import { App } from './components/App';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  
  if (appContainer) {
    const app = new App(appContainer);
    app.render();
  } else {
    console.error('Could not find app container element!');
  }
});