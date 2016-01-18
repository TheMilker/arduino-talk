import {Directive, ElementRef, NgZone} from 'angular2/core';
declare var jsmpeg: any;

@Directive({
    selector: '[camera-feed]'
})
export class CameraFeedDirective {
    constructor(private el: ElementRef, private zone: NgZone) {       
        zone.run(() => {
            // Reference: https://github.com/phoboslab/jsmpeg/blob/master/stream-example.html
            var wsUrl = 'ws://localhost:8084/';
            var canvas = <HTMLCanvasElement>el.nativeElement;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#333';
            ctx.fillText('Loading...', canvas.width/2-30, canvas.height/3);
            // Start the player        
            var client = new WebSocket(wsUrl);        
            var player = new jsmpeg(client, { canvas:canvas });
        });
    }
}