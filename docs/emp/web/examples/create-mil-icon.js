var sym = new emp3.api.MilStdSymbol({
    name: "Example Unit",
    position: {
        latitude: 35.6586,
        longitude: 139.7454,
        altitude: 0
    },
    symbolCode: "SFGPUCI----K---", // Friendly Infantry symbol code from MIL-STD-2525
    // Modifiers are optional and documented in the MIL-STD-2525 document
    modifiers: {
        uniqueDesignation1: '1BCT', 
        higherFormation: '3ID'
    }
});

// create an Overlay to contain the MilStdSymbol Feature.  Overlays are used to group features.  Features cannot be added directly to a map, they must be on an overlay.
var overlay1 = new emp3.api.Overlay({
    name: "overlay1",
    geoId: "w834mne-sdg5467-sdf-we45"
});

// Add the MilStdSymbol to the overlay
overlay1.addFeature({
    feature: sym,
    visible: true
});

// Add the overlay to the map.  NOTE: Features can be added to overlay before and after it has been addded to the map
map1.addOverlay({
    overlay: overlay1,
    onSuccess: function() {
        // Zoom to the newly added feature
        map1.zoomTo({
            feature: sym
        })
    },
    onError: function() {
        alert(JSON.stringify(error));
    }
});

// Add another feature to overlay after adding to map
var sym2 = new emp3.api.MilStdSymbol({
    name: "Example Unit 2",
    position: {
        latitude: 35.6540,
        longitude: 139.7410,
        altitude: 0
    },
    symbolCode: "SHGPUCI--------" // Hostile Infantry symbol code from MIL-STD-2525

});
overlay1.addFeature({
    feature: sym2,
    visible: true
});