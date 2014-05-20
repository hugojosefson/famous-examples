/**
 * Copyright (c) 2014 Famous Industries, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * @license MIT
 */


/**
 * TransitionableTransform
 * --------
 *
 * TransitionableTransform is a class for transitioning
 * the state of a Transform by transitioning its translate,
 * scale, skew and rotate components independently.
 *
 * In this example, there is a surface having its scale
 * affected by a TransitionableTransform.
 */
define(function (require, exports, module) {
    var Engine = require("famous/core/Engine");
    var Surface = require("famous/core/Surface");
    var ImageSurface = require("famous/surfaces/ImageSurface");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var Modifier = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");
    var TransitionableTransform = require("famous/transitions/TransitionableTransform");
    var TweenTransition = require('famous/transitions/TweenTransition');
    var Easing = require('famous/transitions/Easing');
    TweenTransition.registerCurve('inQuad', Easing.inQuad);
    TweenTransition.registerCurve('inCubic', Easing.inCubic);
    TweenTransition.registerCurve('inQuart', Easing.inQuart);

    var mainContext = Engine.createContext();

    var imageContainerSurface = new ContainerSurface({
        size: [150, 150],
        properties: {
//            overflow: 'hidden'
            perspective: '500px'
        }
    });

    var frontImage = new ImageSurface({
        size: [150, 150]
    });
    frontImage.setContent("/content/movie-front.jpg");

    var backImage = new ImageSurface({
        size: [150, 150]
    });
    backImage.setContent("/content/movie-back.jpg");

    var transitionableTransform = new TransitionableTransform();

    var modifier = new Modifier({
        origin: [.5, .5],
        transform: transitionableTransform
    });

    // Enable two states in this app,
    // so that when the tile has flipped,
    // we keep that image visible,
    // and let the user click again to flip to the other side.
    var showOtherSide = false;

    function onClick() {
        imageContainerSurface.removeListener("click", onClick);
        transitionableTransform.setRotate([Math.PI, 0, 0], {duration: 600, curve: "inQuad"}, function () {
            showOtherSide = !showOtherSide;
            transitionableTransform.setRotate([0, 0, 0], {duration: 0}, function () {
                imageContainerSurface.on("click", onClick);
            });
        });
    }

    imageContainerSurface.on("click", onClick);

    /**
     * Hack(?) to figure out where in the animation we are.
     *
     * @returns {boolean}
     */
    function isShowingFront() {
        return transitionableTransform.get()[5] > 0;
    }

    var frontOpacitator = new Modifier({opacity: function () {
        return isShowingFront() ^ showOtherSide ? 1 : 0; // ^ means XOR in this case
    }});
    var backOpacitator = new Modifier({opacity: function () {
        return isShowingFront() ^ showOtherSide ? 0 : 1;
    }});

    var flip = Transform.rotateX(Math.PI);

    var frontFlipper = new Modifier({origin: [.5, .5], transform: function () {
        return showOtherSide ? flip : Transform.identity;
    }});

    var backFlipper = new Modifier({origin: [.5, .5], transform: function () {
        return showOtherSide ? Transform.identity : flip;
    }});

    imageContainerSurface.add(frontOpacitator).add(frontFlipper).add(frontImage);
    imageContainerSurface.add(backOpacitator).add(backFlipper).add(backImage);

    mainContext.add(modifier).add(imageContainerSurface);
});
