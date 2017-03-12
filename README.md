# PiLapse

Configures a timelapse camera for a Raspberry Pi.

> This is based on an idea by [Alex Ellis](http://blog.alexellis.io/raspberry-pi-timelapse). This container has a couple
> of additions, including getting sunrise/sunset times, backup to Dropbox and generation and tweeting of a video.
>
> This uses [Sunrise Sunset](http://sunrise-sunset.org/api) to calculate when it's daylight

# Installing

## Install Docker on a Pi

For full instructions on installing Docker on a Raspberry Pi, take a look at
[Alex Ellis's blog](http://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi)

## Running the Image

```
docker run --name pilapse -v /path/to/image/store:/var/image -v $PWD/config.json:/opt/app/config.json --privileged --restart=always -d pilapse
```
