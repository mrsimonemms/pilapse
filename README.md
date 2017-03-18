# PiLapse

Configures a timelapse camera for a Raspberry Pi.

## Features

 - Use sunrise/sunset times for your location to decide when to record
 - Automatically generate a video from the images
 - Backup images/videos to Dropbox
 - Automatically tweet the video once generated

> This is based on an idea by [Alex Ellis](http://blog.alexellis.io/raspberry-pi-timelapse)
>
> This uses [Sunrise Sunset](http://sunrise-sunset.org/api) to calculate when it's daylight

# Installing

## Install Docker on a Pi

For full instructions on installing Docker on a Raspberry Pi, take a look at
[Alex Ellis's blog](http://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi)

## Running the Image

> View on [Docker Hub](https://hub.docker.com/r/riggerthegeek/pilapse/)

There are some optional volumes:
 - `/opt/app/config.json`: the config file. You will probably want to set your own config.
 - `/opt/app/pilapse.sql`: the SQLite file. If you want this stored on your Pi, you will need to do this.
 - `/var/image`: the image store. If you want to have the images stored on your Pi, you will need to do this.


```
docker run --name pilapse -v /path/to/image/store:/var/image -v $PWD/config.json:/opt/app/config.json --privileged --restart=always -d riggerthegeek/pilapse:$(uname -m)
```

# Config

The config allows granular control over the timelapse pictures and videos.

## Sample config.json

```json
{
  "lat": 52.482154,
  "long": -1.894503,
  "schedule": [{
    "cleanup": {
      "disabled": false,
      "interval": "* */6 * * *"
    },
    "dropbox": {
      "disabled": false,
      "accessToken": "some token",
      "savePath": "/Timelapses/daily",
      "interval": "*/15 * * * *"
    },
    "photo": {
      "disabled": false,
      "group": "D",
      "interval": "* * * * *",
      "savePath": "/var/image/daily",
      "startTime": "04:00",
      "endTime": "22:00",
      "raspistillOpts": [
        "-hf",
        "-vf"
      ]
    },
    "video": {
      "disabled": false,
      "interval": "0 23 * * *",
      "savePath": "/var/image/daily-video"
    }
  }]
}
```

Get lat/long coords from [www.latlong.net](http://www.latlong.net)

### Root

- `lat`: The Pi's latitude. This is used to calculate sunrise/sunset times
- `long`: The Pi's longitude. This is used to calculate sunrise/sunset times
- `schedule`: An array of different schedule objects

### Schedule

- `cleanup`: Specifies how to cleanup uploaded/generated images
- `dropbox`: Specifies how to save to dropbox
- `photo`: Specifies how to take photos
- `video`: Specifies how to generate a video from the photos

### Cleanup

- `disabled`: If you want to disable it, set to `true`
- `interval`: [Cron notation](https://crontab.guru) to decide when this should run

### Dropbox

- `accessToken`: The Dropbox access token, which you can get from [Dropbox](https://www.dropbox.com/developers/apps)
- `disabled`: If you want to disable it, set to `true`
- `interval`: [Cron notation](https://crontab.guru) to decide when this should run
- `savePath`: Specifies where in your Dropbox account to save the files

### Photo

- `disabled`: If you want to disable it, set to `true`
- `endTime`: Time to stop taking photos - will use sunset time if not set
- `group`: Decides how to group the photos. By default, it's `D` (daily). Can also have `M` (monthly) and `Y` (yearly)
- `interval`: [Cron notation](https://crontab.guru) to decide when this should run
- `raspistillOpts`: Array of options sent with the [raspistill](https://www.raspberrypi.org/documentation/usage/camera/raspicam/raspistill.md) command
- `savePath`: Specified where to save your files locally
- `startTime`: Time to start taking photos - will use sunrise time if not set

### Video
- `disabled`: If you want to disable it, set to `true`
- `interval`: [Cron notation](https://crontab.guru) to decide when this should run
- `savePath`: Specified where to save your files locally
