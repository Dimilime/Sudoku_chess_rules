<?php

$host = "db";
$port = "5432";
$dbname = "sudokudb";
$user = "user";
$pwd= "pass";


//On établit la connexion à la base de donnée
try 
{
    $dbh=new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$pwd");
    //Existence des champs
    //L'utilisateur est inscrit dans la bdd s'il n'existe pas
    $name = $_GET["name"] ?? null;
    $gid = $_GET["gid"] ?? null;
    $pid = $_GET["pid"] ?? null;
    if (isset($name)){
        $sql = "INSERT INTO players(name) values(?) ";
        $stm=$dbh ->prepare($sql);
        $stm->execute(array($name));
    }

    //on selectionne les grilles qui ne sont pas encore joué, au hasard
    //$sql = "select g.gid, g.grille, g.knight, g.king, g.noseq from playedgrid AS PG right join grilles g on PG.gid = g.gid right join players p on p.pid = PG.pid where PG.gid is not null and PG.pid is not null order by random() limit 1";
    $sql = "select g.gid, grille, knight, king, noseq from grilles g left join playedgrid p on g.gid = p.gid where p.gid isnull and p.pid isnull order by random() limit 1";

    $stm=$dbh ->prepare($sql);
    $stm->execute();
    $data= array();
    $res= $stm-> fetch(PDO::FETCH_ASSOC);
    $data[]=$res;
    if(isset($name)){
        $sql = "select pid, name from players where name='$name'";
        $stm=$dbh ->prepare($sql);
        $stm->execute();
        $player= array();
        $res= $stm-> fetch(PDO::FETCH_ASSOC);
        $player= $res;
        $data[]=$res;
    }
    echo json_encode($data);
    //quand le joeur à terminé la partie on insert sa grille dans les grilles terminé
    if(isset($pid) && isset($gid)){
        $sql = "INSERT INTO playedgrid(pid, gid) values(?,?) ";
        $stm=$dbh ->prepare($sql);
        $stm->execute(array($pid,$gid));
    }

}
catch (PDOException $e)
{
    echo json_encode("Erreur : " . $e->getMessage()) ;
}
?>






