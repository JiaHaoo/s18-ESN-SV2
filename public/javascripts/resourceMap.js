var map;
var newResourceMarker = {};

function createMarker(position) {
    var marker = new google.maps.Marker();
    return marker;
}


function createMarkerWithInfoWindowContent(position, contentOptions) {
    var marker = new google.maps.Marker({
        position: position,
        // icon:'pinkball.png'
    });
    var infoWindow = new google.maps.InfoWindow({
        content: contentOptions.content,
    });
    marker.addListener('click', function () {
        infoWindow.open(map, marker);
    });
    infoWindow.addListener('domready', function () {
        console.log('run script ' + contentOptions.formId);
        var jqform = $('#' + contentOptions.formId);
        jqform.submit(function (e) {
            e.preventDefault();
            $.post('/v1/resourceMap/resources/' + contentOptions.resourceId + '/claim',
                jqform.serialize(),
                function () {
                    location.reload();
                });
        });
    });
    return { marker: marker, infoWindow: infoWindow };
}


function disableQuantity(cb) {
    var shouldDisable = cb.checked;
    $('#quantityInput').prop('disabled', shouldDisable);
    $('#unitInput').prop('disabled', shouldDisable);
}

function updateNewResourceInfoWindow(latlng) {
    if (!newResourceMarker.infoWindow) {
        newResourceMarker.infoWindow = new google.maps.InfoWindow();
    }
    var latitude = latlng.lat();
    var longitude = latlng.lng();

    var contentString = `
            <form id ="newResourceForm" class="container" action = "#" >
                <input type="hidden" name="latitude" value="` + latitude + `">
                    <input type="hidden" name="longitude" value="` + longitude + `">
                        <div class="form-group">
                            <label for="resourceNameInput">Resource Name</label>
                            <input class="form-control" type="text" value="" placeholder="potatoes" id="resourceNameInput" name="name" required>
    </div>

                            <div class="form-group">
                                <label for="detailsTextarea">Details </label>
                                <textarea class="form-control" id="detailsTextarea" placeholder="write details about your resource..." rows="2" name="details"></textarea>
                            </div>

                            <div class="form-group">
                                <div class="form-check">
                                    <label class="form-check-label">
                                        <input class="form-check-input" type="checkbox" id="unlimitedInput" value="" onclick="disableQuantity(this);" name="unlimited"> Resource is unlimited
            </label>
        </div>
                                </div>
                                <div class="form-group">
                                    <div class="input-group mb-2 mr-sm-2 mb-sm-0">
                                        <div class="input-group-prepend">
                                            <div class="input-group-text">Quantity</div>
                                        </div>
                                        <input type="number" class="form-control" id="quantityInput" placeholder="5" name="quantity" required>
                                            <div class="input-group-text">Unit</div>
                                            <input type="text" class="form-control" id="unitInput" placeholder="lb" name="unit" required>
        </div>
    </div>
                                        <div class="form-group">
                                            <button type="submit" class="btn btn-primary">Submit</button>
                                        </div>
</form>
                                    `;
    newResourceMarker.infoWindow.setContent(contentString);
}

function createNewResourceMarker(latlng) {
    if (!newResourceMarker.marker) {
        newResourceMarker.marker = createMarker();
    }
    newResourceMarker.marker.setPosition(latlng);
    updateNewResourceInfoWindow(latlng);
    newResourceMarker.infoWindow.addListener('closeclick', function () {
        newResourceMarker.marker.setMap(null); //remove marker when infoWindow is closed
        //todo: reset create mode
    });
}

// singleton new resourceMarker
function showNewResourceMarker(latlng) {
    newResourceMarker.marker.setPosition(latlng);
    newResourceMarker.marker.setMap(map);
    newResourceMarker.infoWindow.open(map, newResourceMarker.marker);
    createNewResourceMarker(latlng);
    $('#newResourceForm').submit(function (e) {
        e.preventDefault();
        $.post('/v1/resourceMap/resources',
            $('#newResourceForm').serialize(),
            function () {
                location.reload();
            });
    })
}

function hideNewResourceMarker(position) {
    newResourceMarker.marker.setMap(null);
}

function contentStringFromResource(resource) {
    var formId = `claimForm-` + resource._id;
    var content = `
    <form class="container" id="` + formId + `" action="#">
    <div class="form-group">

        <div class="row">
            <h3>` + resource.name + `</h3>
        </div>

        <div class="row">
            <h6>description:</h6>
        </div>
        <div class="row">` + resource.details + `</div>
    </div>
    <hr>`;

    if (resource.unlimited) {
        content += `
            <h5> UNLIMITED resource! </h5>
        `;
    } else {
        content += `
        <div class="row form-group">
            <h6>
                <b>remaining:</b>
                <span class="badge  badge-pill badge-info">` + resource.remainingQuantity + `</span> out of
                <span class="badge  badge-pill badge-info">` + resource.quantity + `</span> ` + resource.unit + `(s)
            </h6>
        </div>
        <div class="row form-group">
            <div class="input-group mb-2 mr-sm-2 mb-sm-0">
                <div class="input-group-prepend">
                    <div class="input-group-text">I would like to claim </div>
                </div>
                <input type="number" class="form-control" id="amountInout" name="amount" placeholder="1 to ` + resource.remainingQuantity + `" name="quantity" required min="1" max="` + resource.remainingQuantity + `">
                <div class="input-group-append">
    
                    <div class="input-group-text">` + resource.unit + `(s)</div>
                </div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>`;
    }
    content += `</form> `;
    return { content: content, formId: formId, resourceId: resource._id };
}

function loadAndShowResourceMarkers() {

    $.get('/v1/resourceMap/resources', function (resources) {
        var iclaimed = '';
        var ipublished = '';
        for (res of resources) {
            var relatedToMe = false;
            if (res.owner.username === username) {
                ipublished += `<li class="list-group-item"><h4>` + res.name + `</h4><h6>claimers: ` + res.claimers.map(function (o) { return o.user.username }).join(', ') + `</h6><h6>remaining: ` + (res.unlimited ? 'Unlimited' : res.remainingQuantity) + `</h6></li>`;
                relatedToMe = true;
            }

            var myClaim = res.claimers.find(function (o) { return o.user.username === username; });
            if (myClaim) {
                iclaimed += `<li class="list-group-item"><h4>` + res.name + `</h4><h6>publisher: ` + res.owner.username + `</h6><h6>my claim: ` + (res.unlimited ? 'Unlimited' : myClaim.amount) + `</h6></li>`;
                relatedToMe = true;
            }

            if (res.unlimited || res.remainingQuantity > 0) {
                relatedToMe = true;
            }

            //hide unrelated and exausted resources
            if (relatedToMe) {
                var latlng = new google.maps.LatLng(res.location.coordinates[1], res.location.coordinates[0]);
                var pair = createMarkerWithInfoWindowContent(latlng, contentStringFromResource(res));
                pair.marker.setMap(map);
            }


        }
        $('#ipublishedul').html(ipublished);
        $('#iclaimedul').html(iclaimed);
    });
}
// will be updated whenever new resource location reloaded.
var newResourceLocation;

function initMap() {

    var mapProp = {
        zoom: 15
    };

    map = new google.maps.Map(document.getElementById("resourceMap"), mapProp);

    navigator.geolocation.getCurrentPosition(
        function (position) {

            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            createNewResourceMarker(latlng);
            google.maps.event.addListener(map, 'click', function (e) {
                showNewResourceMarker(e.latLng);
            });

            map.setCenter(latlng);
        },
        function (err) {
            alert("this feature requires your location. Please allow us to get your location.");
        });

    loadAndShowResourceMarkers();
}