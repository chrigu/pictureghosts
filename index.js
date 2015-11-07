var Jimp = require("jimp")
    ExifImage = require('exif').ExifImage,
    argv = require('optimist').argv,
    fs = require('fs'),
    Promise = require("promise"),
    moment = require('moment');

//general settings
var path = argv._[0],
    height = 600,
    dateFormat = "YYYY:MM:DD HH:mm:ss";

//reads the image's pixels and return the average rgb value
function readPixels(imagePath) {
    return Jimp.read(imagePath).then(function (image) {

        var buffer,
            pixels,
            rgbSum = [0,0,0];

        buffer = image.bitmap.data;
        pixels = buffer.length/4;

        for (var i = 0;i < buffer.length;i+=4) {
            rgbSum[0] += buffer[i];
            rgbSum[1] += buffer[i+1];
            rgbSum[2] += buffer[i+2];
        }

        return rgbSum.map(function(value) { return Math.round(value/pixels) });

    }).catch(function (err) {
        console.error(imagePath);
        console.error(err);
        return null;
    });
}


//get the image's date from the EXIF data
function readExif(imagePath) {

    return new Promise(function (resolve, reject) {
        try {
            new ExifImage({ image : imagePath }, function (error, exifData) {
                if (error) {
                    console.log('Error: ' + error.message);
                    return resolve(null)
                }
                else {
                    if (exifData.exif.CreateDate) {
                        return resolve(moment(exifData.exif.CreateDate, dateFormat));
                    } else if (exifData.exif.DateTimeOriginal) {
                        return resolve(moment(exifData.exif.DateTimeOriginal, dateFormat));
                    } else { return resolve(null) }
                }
            });
        } catch (error) {
            console.log('Error: ' + error.message);
            return reject(error.message);
        }
    });
}


//get images from dir
function getImages(files) {
    return new Promise(function (resolve, reject) {
        var promises = [];

        for (var i = 0; i < files.length; i++) {
            var promise = new Promise(function (resolve, reject) {

                var filePath = path + "/" + files[i];

                Promise.all([readPixels(filePath), readExif(filePath)]).then(function (values) {
                    console.log(filePath);
                    resolve({
                        file: filePath,
                        pixels: values[0],
                        date: values[1]
                    });
                }).catch(function (error) {
                    console.log("follow fail");
                    console.log(filePath);
                    resolve({
                        file: filePath,
                        pixels: values[0],
                        date: values[1]
                    });
                });
            });

            promises.push(promise)
        }

        Promise.all(promises).then(function(data) {
            resolve(data);
        }).catch(function(error) {
            console.log("catch");
            resolve(data);
        });

    });
}

//sort images by date
function sortImages(images) {
    return images.filter(function(obj) {
        if (obj.date && obj.pixels) { return true }
        else { return false }
    }).sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.date) - new Date(b.date);
    });
}

//read directory
fs.readdir(path, function(err, files) {
    getImages(files).then(function(images) {
        var imageData = sortImages(images);
        new Jimp(imageData.length, height, function (err, image) {
            for (var i = 0;i < imageData.length;i++) {
                for (var j = 0;j < height;j++) {
                    var hex = Jimp.rgbaToInt(imageData[i].pixels[0], imageData[i].pixels[1], imageData[i].pixels[2], 255);
                    image.setPixelColor(hex, i, j);
                }
            }
            image.write("out.png");
        });
    }, function(error) {
        console.log("fail");
        console.log(error);
    });
});

