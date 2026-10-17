import{installWelcomeEvents}from'./features/today/welcome.js';
import{installInfographicEvents}from'./features/infographics/index.js';
import{setupOffline}from'./state/offline.js';
import {installModernEvents} from './features/modern/controller.js';
import {scheduleSearchIndex} from './features/search/search-index.js';
import './styles/base.css';
import { bootstrap } from './bootstrap.js';
import '#test-entry';
bootstrap();
installModernEvents();
installInfographicEvents();
installWelcomeEvents();

scheduleSearchIndex();

setupOffline();
