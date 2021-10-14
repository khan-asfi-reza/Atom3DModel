var slider = document.getElementById("slider");
var main = 1;


function reduceElements(n, elements=root_elements){
    return elements.filter((each) => each.number === n )
}


function init(selected, elements=root_elements){

    var currentElement = reduceElements(selected, elements)[0];

    var Colors = {
        red:0x1A9DE4,
        white:0x1A9DE4,
        brown:0x1A9DE4,
        sky:0x1A9DE4,
        brownDark:0x1A9DE4,
        blue:0x1A9DE4,
    };

    var scene = new THREE.Scene();
    var cvx = document.getElementById("canvas");
    var width = window.innerWidth;
    var height = window.innerHeight;

    var camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        -1000,
        1000
    )

    camera.position.z = 2;

// Create a renderer with Antialiasing
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

// Configure renderer clear color
    renderer.setClearColor("#fff", 0);

// Configure renderer size
    renderer.setSize( window.innerWidth, window.innerHeight );

// Append Renderer to DOM
    document.body.appendChild( renderer.domElement );


// Light
    var ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);

    var lights = [];

    lights[0] = new THREE.PointLight(0xffffff, 0.5, 0);
    lights[0].position.set(200, 00, 0);

    lights[1] = new THREE.PointLight(0xffffff, 0.5, 0);
    lights[1].position.set(0, 200, 0);

    lights[2] = new THREE.PointLight(0xffffff, 0.5, 0);
    lights[2].position.set(0, 100, 100);

    lights[3] = new THREE.AmbientLight(0xffffff, 0.6);

    lights.forEach(function(light){
        scene.add(light);
    })

    /*
    Geometry
    */
    function createTorus(r, tubeD, radialSegs, tubularSegs, arc, color, rotationX){
        var geometry = new THREE.TorusGeometry(r, tubeD, radialSegs, tubularSegs, arc);
        var material = new THREE.MeshLambertMaterial({ color: color || "#ff7171" });
        var torus = new THREE.Mesh(geometry, material);
        torus.rotation.x = rotationX;

        return torus;
    }

    function createLine(){
        var material = new THREE.LineBasicMaterial({
            color: 0x1A9DE4
        });

        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3( 0, 10, 0 ),
            new THREE.Vector3( 0, -10, 0 )
        );

        var line = new THREE.Line( geometry, material );

        return line;
    }

    /*
    r
    color
    x
    y
    */
    function createSphere(params){
        var geometry = new THREE.SphereGeometry( width / (params.r || 40), 50, 50 );
        var material = new THREE.MeshPhongMaterial({
            color: params.color || Colors.blue,
            transparent: true,
            opacity: 0.8
        });
        var sphere = new THREE.Mesh( geometry, material );

        sphere.position.x = params.x || 0;
        sphere.position.y = params.y || 0;

        return sphere;
    }


    /* create stuff */
    const baseRadius = (width > height ? (height - 40 / 2) : (width - 40 / 2));

    function createValence(ringNumber, electronCount){
        var radius = 50 + (baseRadius / 20) * ringNumber;

        var ring = createTorus(
            radius,
            baseRadius / 600,
            20,
            100,
            Math.PI * 2,
            '#ffffff',
            0
        );

        var electrons = [];

        var angleIncrement = (Math.PI * 2) / electronCount;
        var angle = 0;

        for (var i = 0; i < electronCount; i++) {
            // Solve for x and y.
            var posX = radius * Math.cos(angle);
            var posY = radius * Math.sin(angle);

            angle += angleIncrement;

            var electron = createSphere({ r: 120, x: posX, y: posY, color: Colors.sky });
            electrons.push(electron);
        }

        var group = new THREE.Group();

        group.add(ring);

        electrons.forEach(function(electron){
            group.add(electron);
        });

        return group;
    }

    var nucleus = createSphere({ color: Colors.sky });
    scene.add(nucleus);

    var shellCounts = currentElement.electrons;

    var valenceCount = currentElement.electrons.length;

    var valences = [];

    for (var l = 1; l <= valenceCount; l++) {
        var shellCountIndex = (l - 1) % shellCounts.length;
        var v = createValence(l, shellCounts[shellCountIndex]);

        valences.push(v);

        scene.add(v);
    }



    /*
    Render
    */
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var render = function(){
        requestAnimationFrame(render);

        var baseRotation = 0.01;

        valences.forEach(function(v, i){
            v.rotation.y += baseRotation - (i * 0.001);
            v.rotation.x += baseRotation - (i * 0.001);
            v.rotation.z += baseRotation - (i * 0.001);
        })

        nucleus.rotation.x += 0.01;
        nucleus.rotation.y += 0.01;

        renderer.render(scene, camera);
    };

    cvx.innerHTML = "";
    cvx.appendChild(renderer.domElement)

    render();
}



function renderElementList(selected, elements=root_elements) {
    function stringifyElectrons(arr){
        var str = "";
        for(var j=0; j < arr.length; j++){
            str += arr[j]
            if(j < arr.length - 1){
                str += ", "
            }
        }
        return str;
    }

    var myElements = elements;

    var ceDom = document.getElementById("currentElement")
    var cElem = reduceElements(parseInt(selected), root_elements)[0];
    ceDom.innerHTML = `<h4> ${cElem.name} </h4>`
    var currentElemHtml = document.getElementById("info");
    currentElemHtml.innerHTML = "<div class=\"card elem-card p-3 w-25 bottom-elem\">\n" +
        "            <div class=\"d-flex flex-row justify-content-between\">\n" +
        "                <h2>" + cElem.name +
        "</h2>\n" +
        "                <h3>" + cElem.small +
        "</h3>\n" +
        "            </div>\n" +
        "            <div>\n" +
        "                <p>Number: " + cElem.number +
        "</p>\n" +
        "            </div>\n" +
        "            <div>\n" +
        "                <p>Electrons: " + stringifyElectrons(cElem.electrons) +
        "</p>\n" +
        "            </div>\n" +
        "            <div>\n" +
        "                <p>Group: " + cElem.group +
        "</p>\n" +
        "            </div>\n" +
        "        </div>"
    slider.innerHTML = "";

    for (var i=0;i < myElements.length; i++){
        var temp = document.createElement("li");
        temp.classList.add("p-4", "elem-card", "card", "splide__slide");
        if(myElements[i].number === parseInt(selected)){
            temp.classList.add("selected")
        }
        temp.dataset.elem = myElements[i].number;
        temp.onclick = function (){
            run(parseInt(this.dataset.elem));
            main = parseInt(this.dataset.elem);
        }
        temp.innerHTML = "<div class=\"d-flex flex-row justify-content-between mb-2\">\n" +
            "                    <h3>" + myElements[i].name +
            "</h3>\n" +
            "                    <p>" + myElements[i].small +
            "</p>\n" +
            "                </div>\n" +
            "                <div>\n" +
            "                    <p>" + myElements[i].molar +
            "</p>\n" +
            "                </div>\n" +
            "                <div>\n" +
            "                    <p> Electrons: " + stringifyElectrons(myElements[i].electrons) +
            "</p>\n" +
            "                </div>"+
            "<div>" +"<p> Group: " + myElements[i].group +
            "</p>"
        "</div>";
        slider.appendChild(temp);
    }

    var splide = new Splide( '.splide', {
        type   : 'slide',
        height: 240,
        perPage: 4,
        gap: 10,
    } );

    splide.mount();
}




function run(x, elements=root_elements){
    renderElementList(x, elements);
    init(x, elements);
}


window.onload = function (){
    run(main, root_elements);
}

var search = document.getElementById("search")


function performSearch(){
    var newElems = root_elements.filter((each) => each.name.toLowerCase() === search.value.toLowerCase());
    if (newElems.length !== 0){
        renderElementList(main, newElems);
        document.getElementById("invalid").innerText = ""
    }else{
        document.getElementById("invalid").innerText = "Invalid Search, Element Not Found"
    }
}
//
// document.getElementById("search_btn").onclick = function (){
//     performSearch();
// }

search.onkeyup = function (e) {
    performSearch();
}