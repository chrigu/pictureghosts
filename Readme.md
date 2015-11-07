# Picture ghosts
## What is it
Pictureghosts averages the color values of a set of pictures and generates a image with these values where the values are sorted by date.

Inspired by [http://thecolorsofmotion.com/films](http://thecolorsofmotion.com/films)

## What it does
1. Reads all pictures from a directory
2. Calculates the average color value for each picture
3. Extracts the date from the picture’s EXIF data
4. Sorts the pictures by date
5. Creates a new picture from this information where each a line represents a picture from the directory

## Run
Export your pictures to a directory. To speed things up make the longest edge about 400px. In order to sort the images one of the following fields must be present in the EXIF data:
- `DateTimeOriginal`
- `CreateDate`

`npm install`

`node index.js /path/to/dirwithimages`

## Todo
- Clean up code
- Options for size & output file