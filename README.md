# arduino-talk

Website to talk to an arduino using express, typescript, and angular2.

https://github.com/voodootikigod/node-serialport to communicate with the arduino from the node server.
http://ffmpeg.org/ to capture a live feed from a usb camera connected to the node server.
https://github.com/websockets/ws to send the video stream to a connected web client from the node server.
https://github.com/phoboslab/jsmpeg to decode the video stream on the client and display onto a <canvas>

This project is an elaborate playground to experiment with technologies that im interested in at the time.

First goal is to have a node server running on a raspberrypi.
A usb camera hooked to the raspberrypi streams a live feed of an arduino uno.
The arduino uno will be connected to the raspberrypi and be able to receive commands via a serial connection.

A web client can connect to the node server on the raspberrypi and see the live stream of the arduino.
There will be two buttons on the web page to turn on and off the LED.
The user can verify the LED turning on and off via the live usb camera feed.

prerequisites:

1. node
2. gulp installed globally
3. ffmpeg installed and in your path

installation instructions:

1. npm install
2. gulp build
3. gulp