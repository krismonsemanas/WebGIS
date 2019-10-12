<?php
    $koneksi = new mysqli("localhost","root","","codingsig") or die(mysqli_error($koneksi));
    function tampil($sql,$koneksi) {
        $data = $koneksi->query($sql) or die(mysqli_error($koneksi));
        $dom = new DOMDocument("1.0");
        $node = $dom->createElement("markers"); //Create new element node
        $parnode = $dom->appendChild($node); //make the node show up
        //set document header to text/xml
        header("Content-type: text/xml"); 
        while($row = $data->fetch_assoc()){
            $node = $dom->createElement("marker");  
            $newnode = $parnode->appendChild($node);
            $newnode->setAttribute("nama",$row['nama']);
            $newnode->setAttribute("alamat", $row['alamat']);  
            $newnode->setAttribute("lat",$row['lat']);  
            $newnode->setAttribute("lng", $row['lng']);  
            $newnode->setAttribute("tipe", $row['tipe']);
        }
        echo $dom->saveXML();
    }
    function proses($sql,$conn){
        $data = $conn->query($sql) or die(mysqli_error($conn));
        if($data){
            return 1;
        }else{
            return 0;
        }
    }    
    if(isset($_POST['typeTombol'])){
       if($_POST['typeTombol'] == "btnTambah"){
        $nama = $_POST['nama'];
        $alamat = $_POST['address'];
        $lat = $_POST['lat'];
        $lng = $_POST['lng'];
        $type = $_POST['type'];
        $query = "INSERT INTO markers VALUES('','$nama','$alamat','$lat','$lng','$type')";
        if(proses($query,$koneksi) == 1){
                echo '
                <div class="card m-3" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">'.$nama.'</h5>
                        <h6 class="card-subtitle mb-2 text-muted">'.$type.'</h6>
                        <p class="card-text">'.$alamat.'</p>
                        <a href="#" id="btnEdit" class="btn btn-info btnEdit">Edit</a>
                        <button name="btnHapus" id="btnHapus" class="btn btn-danger btn-hapus" da>Hapus</button>
                    </div>
                </div>';
            }
       }else if($_POST['typeTombol'] == "btnHapus"){
           $lat = $_POST['lat'];
           $lng = $_POST['lng'];
           $query = "DELETE FROM markers WHERE lat = $lat AND lng = $lng ";
           if(proses($query,$koneksi) == 1) {
                echo "Data telah dihapus";
           }else{
               echo "Data gagal dihapus";
           }
       }else if($_POST['typeTombol'] == "btnEdit"){
            $lat = $_POST['lat'];
            $lng = $_POST['lng'];
            $query = "SELECT * FROM markers WHERE lat = '$lat' AND lng = '$lng' ";
            $data = $koneksi->query($query) or die(mysqli_error($koneksi));
            $row = $data->fetch_assoc();
            echo '
            <div class="row m-3">
                <div class="col">
                    <h3 class="text-center">Form Edit Marker</h3>
                    <form action="function.php" method="post">
                        <div class="form-group">
                            <label for="nama">Nama</label>
                            <input type="hidden" name="id" id="mapId" value="'.$row['id'].'">
                            <input type="hidden" name="lat" id="lat" value="'.$row['lat'].'">
                            <input type="hidden" name="lng" id="lng" value="'.$row['lng'].'">
                            <input type="text" class="form-control" name="nama" id="nama" value="'.$row['nama'].'">
                        </div>
                        <div class="form-group">
                            <label for="alamat">Alamat</label>
                            <textarea  name="alamat" id="alamat" cols="30" rows="3" class="form-control">'.$row['alamat'].'</textarea>
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
                            <button type="submit" class="btn btn-info btn-update" id="btn-update" name="btn-update">Update</button>
                            <button  class="btn btn-danger btn-batal">Batal</button>
                        </div>
                    </form>
                </div>
            </div>
            ';
       }
    }else if(isset($_POST["btn-update"])){
        $id = $_POST['id'];
        $nama = $_POST['nama'];
        $alamat = $_POST['alamat'];
        $lat = $_POST['lat'];
        $lng = $_POST['lng'];
        $type = $_POST['type'];
        $query = "UPDATE markers SET nama = '$nama', alamat = '$alamat', lat = '$lat', lng = '$lng', tipe = '$type' WHERE id = '$id'  ";
        proses($query,$koneksi);
        header("location: index.php");
   }else{
        $sql = "SELECT * FROM markers";
        tampil($sql,$koneksi);
    }
?>