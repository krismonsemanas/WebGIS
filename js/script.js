// jquery
$(document).ready(function(){
    var dataMap = $('#map');
    var map;
    $('#form').hide();
    initMap();
    
    // info window conten
    var contentAdd = `
    <div class="row m-3" style="width: 300px;">
        <div class="col">
        <h3 id="JudulForm" class="text-center">Tambah Marker</h3>
            <form method="post">
                <div class="form-group">
                    <label for="nama_tempat">Nama Tempat</label>
                    <input type="text" name="nama_tempat" class="form-control" id="nama_tempat" placeholder="Nama Tempat">
                </div>
                <div class="form-group">
                    <label for="address">Alamat</label>
                    <textarea class="form-control alamat" row="2"  name="address" id="address" placeholder="Alamat"></textarea>
                </div>
                <div class="form-group">
                    <label for="type" >Type</label>
                    <select class="form-control" id="type" name="type">
                        <option value="">-- Pilih Salah Satu --</option>
                        <option value="house">Rumah</option>
                        <option value="instansi">Instansi/Kantor</option>
                        <option value="rumah makan">Rumah Makan</option>
                        <option value="cafe">Caffe</option>
                    </select>
                </div>
                <div class="form-group">
                    <button name="btnTambah" class="btn btn-info btnSimpan">Simpan</button>
                    <a href="#" id="btnHapus" class="btn btn-danger new-btn-hapus">Hapus</a>
                </div>
            </form>
        </div>
    </div>
    `;
    // vanila javascript
    function initMap() {
        // deklarasi
        let mapCanvas = document.getElementById('map');
        // titik tengah
        var center = {
            lat: -0.0555459,
            lng: 109.3483099
        }
        // load map
        var map =  new google.maps.Map(mapCanvas,
            {
                zoom: 16,
                center: center
            });
            // ex: http://localhost/data.php
            $.get('function.php',function(data){
                console.log(data);
                $(data).find("marker").each(function () {
                    var name 		= $(this).attr('nama');
                    var address 	= '<p>'+ $(this).attr('alamat') +'</p>';
                    var type 		= $(this).attr('tipe');
                    var point 	= new google.maps.LatLng(parseFloat($(this).attr('lat')),parseFloat($(this).attr('lng')));
                    // ex: http://localhost/icon/+type+.png
                    // dinamis marker berdarkan type
                    createMarker(point,map,name,address,type,"icon/"+type+".png",false,false);
              });
            })
            var geocoder = new google.maps.Geocoder;
        // right click event
            google.maps.event.addListener(map,'rightclick',function(event){
                // berufugsi untuk 1 infowindow
                geocoder.geocode({location: event.latLng},function(result) {
                    $('.alamat').html(result[0].formatted_address);
                })
                createMarker(event.latLng,map,'Add New Point',false,false,"icon/pin_blue.png",contentAdd,true);
            })
        }
        // create marker
    function createMarker(point,map,name,address,type,iconPath,infoOpenDefault,drag){
        var content = `
        <div class="card m-3" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">`+name+`</h5>
                <h6 class="card-subtitle mb-2 text-muted">Type: `+type+`</h6>
                <p class="card-text">`+address+`</p>
                <button name="btnEdit" id="btnEdit" class="btn btn-info btnEdit">Edit</button>
                <button name="btnHapus" id="btnHapus" class="btn btn-danger btn-hapus">Hapus</button>
            </div>
        </div>`;
        var marker = new google.maps.Marker({
            position: point,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: iconPath,
            draggable:drag,
        })
        var infowindow = new google.maps.InfoWindow({
            content: content
          });
        marker.addListener('click',function(){
            infowindow.open(map,marker);
        })
        // get location on drag
        if(marker.getDraggable()){         
            marker.addListener('drag',function() {
                var lokasi = marker.getPosition();
                var geocoder = new google.maps.Geocoder;
                geocoder.geocode({location: lokasi },function(result) {
                    $('.alamat').html(result[0].formatted_address);
                })
            })
        }
        // form tambah marker
        if(infoOpenDefault){
            infowindow.setContent(infoOpenDefault);
            infowindow.open(map,marker);
        }
       google.maps.event.addListener(infowindow,'domready',function(){
            // hapus marker   
            var remove = $('.new-btn-hapus');
            remove.click(function() {
                remove_marker(marker);
            });
            // happus marker beserta data di db
            var btnHapus = $('.btn-hapus');
            var getLatLng = marker.getPosition().toUrlValue();
            var pecahLatLng = getLatLng.split(',');
            var lat = pecahLatLng[0];
            var lng = pecahLatLng[1];
            btnHapus.click(function() {
                $.ajax({
                    url: 'function.php',
                    type: 'POST',
                    data: {
                        lat: lat,
                        lng: lng,
                        typeTombol: btnHapus.attr('name')
                    },
                    success:function(data){
                        marker.setMap(null); 
                        alert(data);
                    }
                });
            });
            //  Insert data
            var btnSimpan = $('.btnSimpan');
            btnSimpan.click(function(e) {
                e.preventDefault();
                var namaTempat = $('#nama_tempat').val();
                var alamat = $('#address').val();
                var type = $('#type').val();
                if(namaTempat == '' || alamat == '' || type == ''){
                   alert('Input tidak boleh kosong!');
                }else{
                    $.ajax({
                        url: 'function.php',
                        type: 'POST',
                        data: {
                            nama: namaTempat,
                            address: alamat,
                            lat: lat,
                            lng: lng,
                            type: type,
                            typeTombol: $('.btnSimpan').attr('name')
                        },
                        success:function(res){
                            infowindow.setContent(res);
                            marker.setDraggable(false);
                            marker.setIcon('icon/'+type+".png");
                            infowindow.open(map,marker);
                        }
                    })
                }
            });
            // edit data
            var btnEdit = $('.btnEdit');
            var form = $('#form');
            btnEdit.click(function(e){
                form.show();
                infowindow.setContent("<h6>Edit Marker</h6><br><button class='btn btn-danger btn-batal'>Batal</button>");
                e.preventDefault();
                $.ajax({
                    url: 'function.php',
                    type: 'POST',
                    data: {
                        lat: lat,
                        lng: lng,
                        typeTombol: btnEdit.attr('name')
                    },
                    success:function(result){
                       form.html(result);
                    }
                })
            })
            // tombol batal ditekan
            $('.btn-batal').click(function(e) {
                e.preventDefault();
                infowindow.setContent(content);
                form.hide();
            })
       })
    }
    // simpan atau upate marker
    function save_marker(map,marker,infowindow,data,type){
        $.ajax({
            url: 'function.php',
            type: 'POST',
            data: data,
            success:function(res){
                infowindow.setContent(res);
                marker.setDraggable(false);
                marker.setIcon('icon/'+type+".png");
                infowindow.open(map,marker);
            }
        })
    }
})