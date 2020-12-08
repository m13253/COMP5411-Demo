"use strict";

/**
 * @author Yuchen Ma
 * Copyright (c) 2020, all rights reserved.
**/

window._resourceManager = {
    loadedResources: new Map(),
    noMoreResources: false,
    pendingResources: new Map(),
    pendingResourcesReject: new Map(),
    registerResource: function registerResource(name, dataURL) {
        window._resourceManager.loadedResources.set(name, dataURL);
        const callback = window._resourceManager.pendingResources.get(name);
        if (callback) {
            callback();
        }
        window._resourceManager.pendingResources.delete(name);
        console.log(`Loaded ${name}`);
    }
};

window.addEventListener("load", function onload() {
    window._resourceManager.noMoreResources = true;
    const error = new Error("resource not loaded");
    for (const [name, reject] of window._resourceManager.pendingResourcesReject) {
        if (reject) {
            reject(error);
        }
        console.log(`No more resources, rejecting ${name}`);
    }
})
