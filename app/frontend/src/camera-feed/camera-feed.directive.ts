import {Directive, ElementRef, NgZone} from 'angular2/core';
declare var jsmpeg: any;
declare var io: any;

@Directive({
    selector: '[camera-feed]'
})
export class CameraFeedDirective {
    constructor(private el: ElementRef, private zone: NgZone) {
        zone.run(() => {
            // reference: https://github.com/phoboslab/jsmpeg/blob/master/stream-example.html
            // var wsUrl = 'ws://localhost:8084/';
            // var canvas = <HTMLCanvasElement>el.nativeElement;
            // var ctx = canvas.getContext('2d');
            // ctx.fillStyle = '#333';
            // ctx.fillText('Loading...', canvas.width/2-30, canvas.height/3);
            // // Start the player
            // var client = new WebSocket(wsUrl);
            // var player = new jsmpeg(client, { canvas:canvas });
            // let video: HTMLVideoElement = el.nativeElement as HTMLVideoElement;


            let socket: any = io.connect('http://localhost:7000');
            socket.on('stream', (data: any) => {
                console.log(data);
                // video.src = window.URL.create ObjectURL(data);
            });
        });
    }
}
