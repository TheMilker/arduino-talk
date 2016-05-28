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
            // let wsUrl = 'ws://localhost:8084/';
            // let canvas = <HTMLCanvasElement>el.nativeElement;
            // let ctx = canvas.getContext('2d');
            // ctx.fillStyle = '#333';
            // ctx.fillText('Loading...', canvas.width / 2 - 30, canvas.height / 3);
            // // Start the player
            // let client = new WebSocket(wsUrl);
            // let player = new jsmpeg(client, { canvas: canvas });
            let img: HTMLImageElement = el.nativeElement as HTMLImageElement;

            let socket: any = io.connect('http://localhost:7000');
            socket.on('stream', (data: any) => {
                let arrayBuffer: Uint8Array = new Uint8Array(data.streamData);
                let blob: Blob = new Blob([arrayBuffer], {type: 'image/jpeg'});
                let imageUrl: any = window.URL.createObjectURL(blob);
                // add image data to hidden preloader image, to avoid flicker
                // //after it is preloaded, it it sent to the visible img
                // ui.imgPreloader.attr('src', imageUrl);
                // ui.imgTimestamp.html(imageData.timestamp);
                img.src = decodeURIComponent(imageUrl);
            });

        });
    }
}
