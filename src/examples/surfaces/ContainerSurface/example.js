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
 * ContainerSurface
 * ----------------
 * ContainerSurface is an object designed to contain surfaces and 
 * set properties to be applied to all of them at once.
 * A container surface will enforce these properties on the 
 * surfaces it contains:
 * 
 * - size (clips contained surfaces to its own width and height)
 * 
 * - origin
 * 
 * - its own opacity and transform, which will be automatically 
 *   applied to  all Surfaces contained directly and indirectly.
 *
 * In this example we have a ContainerSurface that contains a Scrollview.
 * Because the ContainerSurface creates its own context the
 * Scrollview will behave according to the size of the ContainerSurface
 * it exists within.  The ContainerSurface having the an overflow of
 * 'hidden' means that the scrollview overflow will be hidden.
 */
define(function(require, exports, module) {
    var Engine           = require("famous/core/Engine");
    var Surface          = require("famous/core/Surface");
    var Modifier         = require("famous/core/Modifier");
    var Transform        = require("famous/core/Transform");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var Scrollview       = require("famous/views/Scrollview");
    var ImageSurface = require("famous/surfaces/ImageSurface");
    var Easing = require('famous/transitions/Easing');
    var TweenTransition = require('famous/transitions/TweenTransition');
    var Transitionable = require('famous/transitions/Transitionable');
    TweenTransition.registerCurve('inQuad', Easing.inQuad);

    var mainContext = Engine.createContext();

    var container = new ContainerSurface({
        size: [400, 400],
        properties: {
            overflow: 'hidden'
//            perspective: '500px'
        }
    });

    var transition = {curve: 'inQuad', duration: 500};
    var rotateMatrix = Transform.rotateX(Math.PI/2);

    var surfaces = [];
    var scrollview = new Scrollview();

//    var temp;
    for (var i = 0; i < 100; i++) {
//        temp = new Surface({
//            size: [undefined, 50],
//            content: 'I am surface: ' + (i + 1),
//            classes: ['red-bg'],
//            properties: {
//                textAlign: 'center',
//                lineHeight: '50px'
//            }
//        });
//        temp.add(new Modifier({origin: [.5, .5]})).add(image);

        var imageContainerSurface = new ContainerSurface({
            size: [200, 200],
            properties: {
//                overflow: 'hidden'
                perspective: '500px'
            }
        });

        var rotateModifier = new Modifier({transform : Transform.identity});

        function triggerTransition1(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable) {
            rotateModifier.setTransform(rotateMatrix, transition, function () {
                frontOpacityTransitionable.set(0);
                backOpacityTransitionable.set(1);
                triggerTransition2(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable);
            });
        }

        function triggerTransition2(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable) {
            rotateModifier.setTransform(Transform.identity, transition, function () {
                triggerTransition3(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable);
            });

        }

        function triggerTransition3(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable) {
            rotateModifier.setTransform(rotateMatrix, transition, function () {
                frontOpacityTransitionable.set(1);
                backOpacityTransitionable.set(0);
                triggerTransition4(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable);
            });
        }

        function triggerTransition4(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable) {
            rotateModifier.setTransform(Transform.identity, transition, function () {
                triggerTransition1(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable);
            });

        }

        var frontImage = new ImageSurface({
            size: [150, 150]
        });
        frontImage.setContent("/content/movie-front.jpg");

        var backImage = new ImageSurface({
            size: [150, 150]
        });
        backImage.setContent("/content/movie-back.jpg");

        var frontOpacityTransitionable = new Transitionable(1);
        var backOpacityTransitionable = new Transitionable(0);
        var frontOpacityModifier = new Modifier({opacity: frontOpacityTransitionable});
        var backOpacityModifier = new Modifier({opacity: backOpacityTransitionable});

        var rotatedContainer = imageContainerSurface.add(new Modifier({origin: [.5, .5]})).add(rotateModifier);
        rotatedContainer.add(frontOpacityModifier).add(frontImage);
        rotatedContainer.add(backOpacityModifier).add(backImage);

        imageContainerSurface.pipe(scrollview);
        surfaces.push(imageContainerSurface);

        triggerTransition1(rotateModifier, frontOpacityTransitionable, backOpacityTransitionable);


    }

    scrollview.sequenceFrom(surfaces);
    container.add(scrollview);

    mainContext.add(new Modifier({origin: [.5, .5]})).add(scrollview);
});
