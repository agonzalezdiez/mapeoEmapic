$( document ).ready(function() {

    d3.queue()
        .defer(d3.json,"data/prueba_apoyos.json")
        .defer(d3.json,"data/prueba_apoyos_2.json")
        .await(ready);

    function ready(error,data,data2){

        console.log("DATA",data,error,data2);

        var formatNumber = function(numero){
                  var es_ES = {
                      "decimal": ",",
                      "thousands": ".",
                      "grouping": [3],
                      "currency": ["€", ""],
                      "dateTime": "%a %b %e %X %Y",
                      "date": "%d/%m/%Y",
                      "time": "%H:%M:%S",
                      "periods": ["AM", "PM"],
                      "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                      "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
                      "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                      "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
                };
                var locale = d3.formatDefaultLocale(es_ES);
                var formato=locale.format(",.1f");
                return formato(numero).replace(',0','');
            };

        	var mymap = L.map('mapid');

                var max_barrios = -1;
        	var min_barrios = 1000000;
        	data.features.forEach(function(d){
                    var valor = (d.properties.apoyos / d.properties.poblacion)*100;
        		d.properties.valor = valor.toFixed(2);
        		// si se cumple la cumple la condición el valor es el max o el min
        		if(valor>max_barrios){max_barrios = valor;}
        		if(valor<min_barrios){min_barrios = valor;}
        	});

                var max_distritos = -1;
        	var min_distritos = 1000000;
        	data2.features.forEach(function(d){
            var valor = (d.properties.apoyos / d.properties.poblacion)*100;
        		d.properties.valor = valor.toFixed(2);
        		// si se cumple la cumple la condición el valor es el max o el min
        		if(valor>max_distritos){max_distritos = valor;}
        		if(valor<min_distritos){min_distritos = valor;}
        	});

                var colorRange = ["#E51800",
                "#E74A00",
                "#EA7C01",
                "#EDAF01",
                "#F0E302",
                "#CDF203",
                "#9CF503",
                "#6BF804",
                "#39FB05",
                "#07FE05"];

                var colorScale_barrios = d3.scaleQuantize().domain([min_barrios,max_barrios]).range(colorRange);
                var colorScale_distritos = d3.scaleQuantize().domain([min_distritos,max_distritos]).range(colorRange);
                //var colorScale = d3.scaleQuantize().domain([min,max]).range(['#FE2E2E','#FE9A2E','#FACC2E','#BFFF00','#01DF01']);
        
                /*function style(feature) {
                    return {
                      weight:1,
                      opacity: 1,
                      color: 'grey',
                      fillOpacity: 0.7,
                      fillColor: colorScale((feature.properties.apoyos/feature.properties.poblacion)*100)//getColor(feature.properties.poblacion, feature.properties.apoyos)
                    };
                }*/
        
                L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                    subdomains: 'abcd',
                    maxZoom: 18
                }).addTo(mymap);
        
        var geojsonLayer_barrios = new L.GeoJSON(data, { style: style_barrios });
        
        geojsonLayer_barrios.addTo(mymap).bindPopup(function(d){ 
            return  '<h2 style="margin-bottom: 0px;margin-top: 0px;">' +  d.feature.properties.nombre + '</h2>'  + '<hr></hr>' + '<h3> Apoyos: ' + formatNumber(d.feature.properties.apoyos) + '</h3>' + '<h3> Población: ' +formatNumber(d.feature.properties.poblacion) + '</h3> <hr>' + '</hr> <h3> Aprobación (*): ' + formatNumber(d.feature.properties.valor)+ ' %' + '</h3>';
        });

        var geojsonLayer_distritos = new L.GeoJSON(data2, { style: style_distritos });
        
        geojsonLayer_distritos.addTo(mymap).bindPopup(function(d){ 
            return  '<h2 style="margin-bottom: 0px;margin-top: 0px;">' +  d.feature.properties.nombre + '</h2>'  + '<hr></hr>' + '<h3> Apoyos: ' + formatNumber(d.feature.properties.apoyos) + '</h3>' + '<h3> Población: ' +formatNumber(d.feature.properties.poblacion) + '</h3> <hr>' + '</hr> <h3> Aprobación (*): ' + formatNumber(d.feature.properties.valor)+ ' %' + '</h3>';
        });

        var bounds = geojsonLayer_distritos.getBounds();
        console.log(bounds);
        mymap.fitBounds(bounds);
        var legend ;
        var grades;
        var mobile = false;
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            grades = [0,30,60,100];
            legend= L.control({position: 'bottomleft'});
            $("#legend-btn").css("display","block");
            $("#legend-btn").click(function(d){
                $(".legend").css("display","block");
                $("#legend-btn").css("display","none");
                $("#legend-close-btn").css("display","block");
            });
            $("#legend-close-btn").click(function(d){
              $(".legend").css("display","none");
              $("#legend-btn").css("display","block");
              $("#legend-close-btn").css("display","none");
            });
            mobile = true;
        }
        
        else{
            grades = [0, 10, 20 ,30, 40, 50, 60, 70, 80, 90, 100]
            legend= L.control({position: 'bottomright'})
            $("#legend-btn").css("display","none");
        }
        
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
            labels = [],
            from, to;
            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
                if(to){
                    labels.push(
                      '<i style="background:' + colorScale_barrios(from) + ' ">  </i>' +
                      from +  (to ? '&ndash;' + to + ' %' : '')) ;
                }
            }
            div.innerHTML = "<h4>% de Aprobación</h4><hr></hr>"+labels.join('<br>');
            return div;
        };
        
        var overlayMaps = {
              "Barrios": geojsonLayer_barrios,
              "Distritos": geojsonLayer_distritos
        };

        L.control.layers(overlayMaps).addTo(mymap);
        
        legend.addTo(mymap);

        if(mobile){
            $(".legend").css("display","none");
            console.log("OCULTO");
        }
        console.log("KMOVIL",mobile);
        
        function style_barrios(feature) {
            {
                return {
                    weight:1,
                    opacity: 1,
                    color: 'grey',
                    fillOpacity: 0.7,
                    fillColor: colorScale_barrios((feature.properties.apoyos/feature.properties.poblacion)*100)//getColor(feature.properties.poblacion, feature.properties.apoyos)
                };
            }
        }
        function style_distritos(feature) {
            {
                return {
                    weight:1,
                    opacity: 1,
                    color: 'grey',
                    fillOpacity: 0.7,
                    fillColor: colorScale_distritos((feature.properties.apoyos/feature.properties.poblacion)*100)//getColor(feature.properties.poblacion, feature.properties.apoyos)
                };
            }
        }
    };

});
