## Summary

Technical test for a job position application: A JavaScript widget to show flickr images inside a webpage.

## How To Use

Insert the `flickr-gallery.css` and `flickr-gallery.js` files in your html file.

Create your widgets adding a container with `flickr-gallery` class and `data-topic` attribute specifying the tag of the photos to be show inside the widget.

Example:
```html
<div class="flickr-gallery" data-topic="cats"></div>
```
Optional attributes:
- **id**: by default the script set an id to the widget container to persist removed images from the widget, but it depends on the order of the elements in the html page. If you want you can specify an id to your widget container and always persists deleted images from your visitors, wherever you put your widget after a template change for example.
- **data-nbr-images**: you can use this attribute to speciffy the number of images that should be loaded.

Complete example:
```html
<div id="cats-gallery" class="flickr-gallery" data-topic="cats" data-nbr-images="4"></div>
```

## How to test locally

### Requirements
`node` and `npm`

### Install
Clone this project. Inside the project folder run:
```sh
$ npm i
```

### Run
```sh
$ npm run dev
```

### Test
Open web browser and access `http://127.0.0.1:8000`
