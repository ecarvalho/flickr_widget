!function() {
  /** setup **/
  var widgetCls = 'flickr-gallery';
  var widgets = {counter: 0};
  var widgetsImages = {};
  var widgetLoadingQueue = [];
  var apiUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=b36822a18ddea0e3bd497a333e3b696d&format=json&jsoncallback=cbFlickrAPIJsonp';
  var defaults = {
    topic: 'nature',
    imagesPerPage: 6
  };

  if (typeof(Storage) !== "undefined") { /* localStorage is available */
    widgets = localStorage.getItem('fgwidgets') || {counter: 0};
    if(typeof(widgets) == "string") {
      widgets = JSON.parse(widgets);
    }
  }

  /** functions **/
  window.cbFlickrAPIJsonp = function(data) {
    var widgetId = widgetLoadingQueue.shift();

    if (data.stat === 'ok'){
      var widget = widgets[widgetId];

      var filteredImages = data.photos.photo.filter(function(item) {
        if(widget.blockedImages.indexOf(item.id) >= 0){
          return false;
        }
        return true;
      });

      widgetsImages[widgetId] = filteredImages.slice(0, widget.currentPage * widget.imagesPerPage);

      printWidget(widget);
    }

    if(widgetLoadingQueue.length > 0) {
      var nextWidget = widgets[widgetLoadingQueue[0]];
      callFlickrApi(nextWidget);
    }
  };

  function handleLoadMore(e) {
    var widgetId = e.target.getAttribute('data-widget');
    var widget = widgets[widgetId];
    widget.currentPage += 1;
    loadWidgetImages(widget);
  }

  function handleRemoveImage(e) {
    var widgetId = e.target.getAttribute('data-widget');
    var imageId = e.target.getAttribute('data-image');
    var widget = widgets[widgetId];
    widget.blockedImages.push(imageId);
    loadWidgetImages(widget);
    updateLocalStorage();
  }

  var elementsFactory = {
    createImageList: function(items) {
      var elem = document.createElement('ul');
      var itemsCount = items.length;
      for(var i=0; i < itemsCount; i++) {
        elem.appendChild(items[i]);
      }
      return elem;
    },
    createImage: function(url) {
      var elem = document.createElement('img');
      elem.setAttribute('src', url);
      return elem;
    },
    createImageLink: function(elImage, url) {
      var elem = document.createElement('a');
      elem.setAttribute('href', url);
      elem.setAttribute('target', '_blank');
      elem.appendChild(elImage);
      return elem;
    },
    createImageItem: function(elImageLink, elBtnRemoveImage) {
      var elem = document.createElement('li');
      elem.appendChild(elImageLink);
      elem.appendChild(elBtnRemoveImage);
      return elem;
    },
    createBtnRemoveImage: function(label, widget, image) {
      var elem = document.createElement('a');
      elem.setAttribute('href', 'javascript:void(0);');
      elem.setAttribute('class', 'fg-btn-remove');
      elem.setAttribute('data-widget', widget);
      elem.setAttribute('data-image', image);
      elem.addEventListener('click', handleRemoveImage);
      elem.innerHTML = label;
      return elem;
    },
    createBtnLoadMore: function(label, widget) {
      var elem = document.createElement('button');
      elem.setAttribute('class', 'fg-btn-load-more');
      elem.setAttribute('data-widget', widget);
      elem.addEventListener('click', handleLoadMore);
      elem.innerHTML = 'Load More';
      return elem;
    }
  }

  function printWidget(widget) {
    var widgetContainer = document.getElementById(widget.id);
    if(!widgetContainer) {
      return false;
    }

    var images = [];
    var imagesCount = widgetsImages[widget.id].length;

    for(var i=0; i < imagesCount; i++) {
      var imageData = widgetsImages[widget.id][i];
      var imageUrl = 'https://farm' + imageData.farm +
                      '.staticflickr.com/' + imageData.server + '/' +
                      imageData.id + '_' + imageData.secret + '_q.jpg';
      var imagePageUrl = 'https://www.flickr.com/photos/'+ imageData.owner +
                          '/' + imageData.id;

      var imageElem = elementsFactory.createImage(imageUrl);
      var imageLink = elementsFactory.createImageLink(imageElem, imagePageUrl);
      var imageRemoveAct = elementsFactory.createBtnRemoveImage('X', widget.id, imageData.id);
      var imageItem = elementsFactory.createImageItem(imageLink, imageRemoveAct);

      images.push(imageItem);
    }

    var imagesList = elementsFactory.createImageList(images);
    var loadMoreAct = elementsFactory.createBtnLoadMore('Load More', widget.id);

    widgetContainer.innerHTML = '';
    widgetContainer.appendChild(imagesList);
    widgetContainer.appendChild(loadMoreAct);
  }

  function callFlickrApi(widget) {
    var pageSize = widget.imagesPerPage * widget.currentPage + widget.blockedImages.length;
    var requestUrl = apiUrl + '&tags=' + widget.topic + '&per_page=' + pageSize;
    var reqScript = document.createElement('script');
    reqScript.setAttribute('src', requestUrl);
    document.body.appendChild(reqScript);
    document.body.removeChild(reqScript);
  }

  function loadWidgetImages(widget) {
    widgetLoadingQueue.push(widget.id);

    if(widgetLoadingQueue.length === 1) {
      callFlickrApi(widget);
    }
  }

  function createWidget(elem) {
    var widgetId = elem.getAttribute('id');
    var widget = widgets[widgetId];

    if(!widget) {
      widget = {
        id: widgetId,
        topic: elem.getAttribute('data-topic') || defaults.topic,
        imagesPerPage: elem.getAttribute('data-nbr-images') || defaults.imagesPerPage,
        blockedImages: [],
        currentPage: 1
      };

      widgets[widgetId] = widget;
      widgets.counter += 1;
    }
    else {
      widget.topic = elem.getAttribute('data-topic') || widget.topic;
      widget.imagesPerPage = elem.getAttribute('data-nbr-images') || widget.imagesPerPage;
      widget.currentPage = 1;
    }

    updateLocalStorage();

    loadWidgetImages(widget);
  }

  function updateLocalStorage() {
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem('fgwidgets', JSON.stringify(widgets));
    }
  }

  /** load widgets **/
  var documentWidgets = document.getElementsByClassName(widgetCls);
  Array.prototype.forEach.call(documentWidgets, function(elem, idx) {
    if(!elem.id) {
      elem.setAttribute('id', 'fg' + idx);
    }

    createWidget(elem);
  });

}();
