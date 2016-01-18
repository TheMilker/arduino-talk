import {Component, View} from 'angular2/core';
import {CameraFeedDirective} from './camera-feed/camera-feed.directive';

@Component({
    selector: 'arduino-talk'
})
@View({
    directives: [CameraFeedDirective],
    template: `
        <h1>Angular 2 beta.1</h1>
        <div class="container">
            <canvas id="canvas-video" width="640" height="480" camera-feed></canvas>
        </div>
    `    
})
export class AppComponent { }