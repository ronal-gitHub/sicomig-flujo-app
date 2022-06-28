const sequelize = require('sequelize');
const axios = require('axios');

const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { now } = require('moment');
const router = express.Router();
// require('../config/passport')(passport);
// rbc const Product = require('../models').Products; //rbc se cambio por tramites
const User = require('../models').usuario;
const DetailDB = require('../models').inf_tramite;
const Even_log = require('../models').event_log;



router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.status(400).send({ msg: 'Por favor introdusca usuario y password.' })
    } else {
        User
            .create({
                login: req.body.username,
                password_hash: req.body.password,
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                email: req.body.email,
                reset_key: 'false' , //req.body.reset_key,
                puesto_id: req.body.puesto_id,
                reset_key: 'false' ,
                transaccion: 'CREAR'               
            }, { //logging: console.log,
                // If plain is true, then sequelize will only return the first
                // record of the result set. In case of false it will return all records.
                plain: false,
                // Set this to true if you don't have a model definition for your query.
                raw: false,
                logging: (sql, queryObject) => {                 
                 //console.log("<<<<<<<<"+ queryObject)// do your own logging
                insertLogUser(sql,req)
                  }})
            .then((user) => res.status(201).send(user))
            .catch((error) => {
                console.log(error);
               
                res.status(400).send(error);
            });
            console.log("===console====");
            //User.console.log;   {logging: console.log}
    
    }
});

router.post('/signin', function (req, res) {
    User
        .findOne({
            where: {
                login: req.body.username
            }
        })
        .then((user) => {
            if (!user) {
                return res.status(401).send({
                    message: 'Autenticacion fallo. El usuario no existe',
                });
            }
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (isMatch && !err) {
                    var token = jwt.sign(JSON.parse(JSON.stringify(user)), 'nodeauthsecret', { expiresIn: 86400 * 30 });
                    jwt.verify(token, 'nodeauthsecret', function (err, data) {
                        console.log(err, data);
                    })
                    res.json({ success: true, token: 'JWT ' + token, login: req.body.username , id:  user.id});
                } else {
                    res.status(401).send({ success: false, msg:  'Autenticacion fallo. Password incorrrecto' });
                }
            })
        })
        .catch((error) => res.status(400).send(error));
});



router.get  ('/flujo', async function (req, res)   {  /// getAllFlujo
  try { //  The variable that received the HTTP data had to use the await keyword to ensure the asynchronous data was received before continuing
    var token = getToken(req.headers);

     if (token) {
      // Verify the token using jwt.verify method
         const decode =   jwt.verify(token, 'nodeauthsecret');
         const rol = await rol_sigla( req.query.login);
         const wsExterno = await    wsExternos(); // llamda a ws wxternos ej INTERPOL
        
         const results = await DetailDB.sequelize.query(" WITH inf_tram_conbinado AS (  "+
            "     SELECT numero_doc, nombres_apellidos, nombres,apellidos, fecha_nac, par_tramite, id_tramite, serie, pais_nac, tipo_doc,	 "+
            "         fecha_exp, fecha_emi, lugar_emision, estado, observacion , fecha_reg 	 "+
            "       FROM dgm_scg_test.inf_tramite inf  "+
            "                WHERE ( numero_doc iLIKE '%'||  COALESCE(NULLIF(:nro_doc :: text, ''), numero_doc) || '%' 	 "+
            "AND (nombres_apellidos iLIKE  '%'||  COALESCE(NULLIF(:nom_apellidos :: text, ''), nombres_apellidos) || '%' ) 	 "+
            "AND nombres iLIKE '%'||  COALESCE(NULLIF(:nombres :: text, ''), nombres) || '%'  AND apellidos iLIKE '%'||  COALESCE(NULLIF(:apellidos :: text, ''), apellidos) || '%' ) 	 "+
            "AND   TO_CHAR(fecha_nac, 'DD/MM/YYYY') = COALESCE(NULLIF(:fecha_nac :: text, ''), TO_CHAR(fecha_nac, 'DD/MM/YYYY') ) 	 "+
            "AND (Extract(year FROM fecha_reg) ::text = COALESCE(NULLIF(:gestion_reg :: text, 'TODOS'), Extract(year FROM fecha_reg)::text) OR (fecha_reg is null  AND   :gestion_reg = 'TODOS' )) 	 "+
            "   UNION   "+
            "           SELECT numero_doc, nombres_apellidos, nombres,apellidos, fecha_nac, par_tramite, id_tramite, serie, pais_nac, tipo_doc, 	 "+
            "       fecha_exp, fecha_emi, lugar_emision, estado, observacion, fecha_reg    "+
            "         FROM dgm_scg_test.inf_tramite inf 	 "+
            "WHERE numero_doc iLIKE '%'||  COALESCE(NULLIF(:nro_doc :: text, ''), numero_doc) || '%'  	 "+          
            "AND nombres iLIKE '%'||  COALESCE(NULLIF(:nombres :: text, ''), 'x') || '%'  AND apellidos   iLIKE '%'||  COALESCE(NULLIF(:apellidos :: text, ''), 'x') || '%'  	 "+
            "AND   TO_CHAR(fecha_nac, 'DD/MM/YYYY') = COALESCE(NULLIF(:fecha_nac :: text, ''), TO_CHAR(fecha_nac, 'DD/MM/YYYY') ) 	 "+
            "AND (Extract(year from fecha_reg) ::text = COALESCE(NULLIF(:gestion_reg :: text, 'TODOS'), Extract(year FROM fecha_reg)::text) OR (fecha_reg is null  AND   :gestion_reg = 'TODOS' ))          "+
            "   UNION 	 "+
            "        SELECT numero_doc, nombres_apellidos, nombres,apellidos, fecha_nac, par_tramite, id_tramite, serie, pais_nac, tipo_doc,  "+
            "         fecha_exp, fecha_emi, lugar_emision, estado, observacion 	, fecha_reg   "+
            "       FROM dgm_scg_test.inf_tramite inf   "+
            "         WHERE  numero_doc iLIKE '%'||  COALESCE(NULLIF(:nro_doc :: text, ''), numero_doc) || '%'  	 "+    
            "AND nombres iLIKE '%'||  COALESCE(NULLIF(:nombres :: text, ''), nombres) || '%'  AND  apellidos iLIKE '%'||  COALESCE(NULLIF(:apellidos :: text, ''), 'x') || '%'  	 "+
            "AND   TO_CHAR(fecha_nac, 'DD/MM/YYYY') = COALESCE(NULLIF(:fecha_nac :: text, ''), TO_CHAR(fecha_nac, 'DD/MM/YYYY') )	 "+
            "AND (Extract(year from fecha_reg) ::text = COALESCE(NULLIF(:gestion_reg :: text, 'TODOS'), Extract(year FROM fecha_reg)::text) OR (fecha_reg is null  AND   :gestion_reg = 'TODOS' )) ),  "+
            "   usu_roles_conbinado AS (          "+
            "   SELECT rol.usuario_id, rol.modulo_sigla , tipo.codigo  FROM  dgm_scg_test.usuario usu, dgm_scg_test.modulo_tipo tipo ,dgm_scg_test.usuario_rol rol  "+
            "    where    usu.login = :login :: text and usu.id = rol.usuario_id and tipo.sigla = rol.modulo_sigla  and  usu.status = 'ACTIVO' AND  rol.permiso_tipo_sigla = :rol :: text   )  "+
            " SELECT id_tramite,mo.modulo_sigla,   nombres_apellidos, fecha_nac, numero_doc,       tipo_doc, pais_nac, serie, fecha_emi, "+
            "   fecha_exp, lugar_emision,  estado, observacion, fecha_reg  , par_tramite         "+
            "   FROM  inf_tram_conbinado inf , usu_roles_conbinado mo      "+
            "   WHERE   inf.par_tramite =   mo.codigo     "+
            "   ORDER BY numero_doc DESC   LIMIT 100  ",         
            {
              replacements: { nro_doc:  req.query.nroDoc , nom_apellidos:  req.query.nomApellidos    
                ,nombres:  req.query.nombres, apellidos: req.query.apellidos   ,fecha_nac:  req.query.fechaNac 
                , gestion_reg:  req.query.gestionReg ,login:  req.query.login ,rol: rol              
            },
              type: DetailDB.sequelize.QueryTypes.SELECT
          });  
          insertLog (results[0],req);

          console.log("===end point flujo====");     // console.log(typeof wsExterno) ; //  console.log(wsExterno);
          console.log(typeof results) ; 
        
          results.push(wsExterno);    
        return  res.status(200).send(results);    // res.json({ success: true, email: req.query.nroDoc });

      } else {
         return res.status(403).send({ success: false, msg: 'Unauthorized.' });
     }
     }catch (error) {
       console.log("===2====");
       console.log((res.json({error:error.message})));
       return res.json({error:error.message});
      }

    });
    
    const rol_sigla = async (login) => {
    
        try {

            if (!login) {
               console.log( 'Param login is null' )
            } else {
               
                const row  =   await User.sequelize.query(
                    "SELECT id FROM dgm_scg_test.usuario WHERE login = $login ",
                    {
                      bind: { login: login },
                      type: User.sequelize.QueryTypes.SELECT
                    }
                  );
                  const rec_rol_permiso  =   await User.sequelize.query(
                    "SELECT permiso_tipo_sigla FROM dgm_scg_test.usuario_rol WHERE usuario_id = $usuario_id AND permiso_tipo_sigla = 'CON' ",
                    {
                      bind: { usuario_id: row[0].id },
                      type: User.sequelize.QueryTypes.SELECT
                    }
                  );
                  const rec_permiso  =   await User.sequelize.query(
                    "SELECT sigla, sigla_padre FROM dgm_scg_test.permiso_tipo WHERE sigla_padre = $sigla_padre ",
                    {
                      bind: { sigla_padre: rec_rol_permiso[0].permiso_tipo_sigla },
                      type: User.sequelize.QueryTypes.SELECT
                    }
                  );
                return rec_permiso[0].sigla_padre
       
            }
        } catch (error) {
                    console.log(error)
                }
    };

      
    
    const insertLog = async (qry,req) => {    
        try {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            if (!qry) {
               console.log( 'Param qry is null' )
            } else {
               
                const row  =   await User.sequelize.query(
                    "SELECT id FROM dgm_scg_test.usuario WHERE login = $login ",
                    {
                      bind: { login: req.query.login },
                      type: User.sequelize.QueryTypes.SELECT
                    }
                  );
                
                Even_log
                    .create({
                        fte_inf_sigla : 'DIGEMIG',
                        usuario_id : row[0].id,
                        start_date :  date+' '+time,
                        end_date :   new Date(),
                        //user_ip : DataTypes.STRING,
                        user_role: 'ADM',
                        descripcion :  'LOG CONSULTA A LA TABLA INF_TRAMITE',
                        param_qry : '{ nro_doc: '+ req.query.nroDoc+  ',nom_apellidos:'+  req.query.nomApellidos +   ',nombres: '+ req.query.nombres +   ', apellidos:'+ req.query.apellidos  +   ', fecha_nac:'+  req.query.fechaNac + ',gestion_reg:'+  req.query.gestionReg +  ',login: '+ req.query.login +'}',  
                        desc_qry : JSON. stringify(qry),
                        transaccion: 'CREAR',
                        usuario_creacion: req.query.login               
                    } )
                    .then((user) => {return 'true'})
                    .catch((error) => { 
                        console.log(error);
                         throw error                  
                    });
                    console.log("===console====");
               
            }
        } catch (error) {
                    console.log(error)
                }
    };

    
const insertLogUser = async (qry,req) => {    
    try {
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        if (!qry) {
           console.log( 'Param qry is null' )
        } else {
           
            const row  =   await User.sequelize.query(
                "SELECT id FROM dgm_scg_test.usuario WHERE login = $login ",
                {
                  bind: { login: req.body.username },
                  type: User.sequelize.QueryTypes.SELECT
                }
              );
         
            Even_log
                .create({
                    fte_inf_sigla : 'DIGEMIG',
                    usuario_id : row[0].id,
                    start_date :  date+' '+time,
                    end_date :   new Date(),
                    //user_ip : DataTypes.STRING,
                    user_role: 'ADM',
                    descripcion :  'INSERCION EN LA TABLA USUARIOS',
                    param_qry : '{username : '+ req.body.username +',usuario_id :'+ row[0].id + ',nombres : '+  req.body.nombres+ ',apellidos : '+  req.body.apellidos +  ', email: '+ req.body.email + ',reset_key :' + req.body.reset_key  +   ',puesto_id: '+  req.body.puesto_id  +'}',  
                    desc_qry : qry,
                    transaccion: 'CREAR',
                    usuario_creacion: req.body.username               
                } )
                .then((user) => {return 'true'})
                .catch((error) => { 
                    console.log(error);
                     throw error                  
                });
                console.log("===console====");
           
        }
    } catch (error) {
                console.log(error)
            }
};

    const wsExternos = async (param1,param2) => {
        var respBodyMinPub= {};
        var respBodyMinPub= {};
        var jsons = new Array();
  
        try {
            const [response1, response2] = await axios.all([
              axios.get('https://jsonplaceholder.typicode.com/users/1'),  // llamda ws INTERPOL
              axios.get('https://jsonplaceholder.typicode.com/users/2XXXX') //  
            ]); 
            // const headerDate = response1.headers && response1.headers.date ? response1.headers.date : 'no response date';
             //  console.log(response2.data.url); //console.log('Date in Response header:', headerDate);
            // if (response1.status != '200') return {};
         
           //  console.log('Status Code:', response1.status); //            console.log( JSON.stringify(response1)); 
                    
           let obj1 = response1.data;  //JSON.parse(response1);
           let obj2 = response2.data; //JSON.parse(response2);         
        //  console.log(typeof response1.data) ;                
         
            jsons.push(obj1);
            jsons.push(obj2);
     
            console.log("===1.1====");     // console.log(jsons);
         //  respBodyInterpol = jsons; 
          } catch (error) {
              
              var today = new Date();
              var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
              var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
              var dateTime = date+' '+time;
              
              console.log("====1.2===");
              var code = error.response.status;
              var errorKey = "801-NOT_FOUND_INTERPOL";
              var message = "Error. El WS se encuentra Fuera de Línea. "+ error.message;
              var path = "https://jsonplaceholder.typicode.com/users";
              
              respBodyInterpol = {
                "code": code,
                "errorKey": errorKey,
                "message": message,
                "path": path,
                "submitTime": dateTime
                } 
                jsons.push(respBodyInterpol);           
            //  respBodyMinPub = JSON.stringify(respBodyMinPub); // JSON.parse(jsons);
             //  console.log(respBodyMinPub);
          }
        
          // desde aqui min pub
          try {
          
            const [response3, response4] = await axios.all([
                axios.get('https://jsonplaceholder.typicode.com/usersXX/3'),  // 
                axios.get('https://jsonplaceholder.typicode.com/users/4') //  llamda ws min publico
              ]); 
                              
           let obj3 = response3.data;  
           let obj4 = response4.data;        
        //  console.log(typeof response1.data) ;                          
            jsons.push(obj3);
            jsons.push(obj4);
        
            console.log("====2.1===");
            //jsons.push(respBodyInterpol);//console.log(jsons);
            return jsons; 

          } catch (error) {
           
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;
            console.log("====2.2===");
              var code =  error.response.status;  //  error.response.data.message)
              var errorKey = "803-NOT_FOUND_MIN_PUB";
              var message = "Error. El WS se encuentra Fuera de Línea. "+error.message;
              var path = "https://jsonplaceholder.typicode.com/users";
             
              var respBodyMinPub = {
                "code": code,
                "errorKey": errorKey,
                "message": message,
                "path": path,
                "submitTime": dateTime
                } 
                           
            //    console.log(typeof respBodyMinPub) ;   // string
               jsons.push(respBodyMinPub);
              // console.log( jsons);   
              // console.log(JSON.stringify(jsons));  //       console.log(JSON.parse(jsons));
              
             return jsons ;
          }
        };
    //    https://exerror.com/unhandledpromiserejectionwarning-this-error-originated-either-by-throwing-inside-of-an-async-function-without-a-catch-block/
 
router.post('/create', function (req, res) {
    const ini_details = {
        par_tramite: req.body.par_tramite,
        nombres_apellidos: req.body.nombres_apellidos,
        fecha_nac: new Date(req.body.fecha_nac),
        numero_doc: parseInt(req.body.numero_doc),
        tipo_doc: req.body.tipo_doc,
        pais_nac: req.body.pais_nac,
        serie: req.body.serie,
        fecha_emi: new Date(req.body.fecha_emi),
        fecha_ven: new Date(req.body.fecha_ven),
        lugar_emi: req.body.lugar_emi,
        estado: req.body.estado,
        observacion: req.body.observacion
    };
    console.log("<<<<<<");
    console.log(ini_details);
    // var token = getToken(req.headers);
    // if (token) {
        DetailDB
            .create(ini_details)
            .then((product) => res.status(201).send(product))
            .catch((error) => res.status(400).send(error));
    // } else {
    //     return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    // }
});

router.post('/update', function (req, res) {

    const ini_details = {
        par_tramite: req.body.par_tramite,
        nombres_apellidos: req.body.nombres_apellidos,
        fecha_nac: req.body.fecha_nac,
        numero_doc: req.body.numero_doc,
        tipo_doc: req.body.tipo_doc,
        pais_nac: req.body.pais_nac,
        serie: req.body.serie,
        fecha_emi: req.body.fecha_emi,
        fecha_ven: req.body.fecha_ven,
        lugar_emi: req.body.lugar_emi,
        estado: req.body.estado,
        observacion: req.body.observacion
    };
    // var token = getToken(req.headers);
    // if (token) {
    DetailDB
        .update(ini_details, {
            where: {id: req.body.id}
        })
        .then((product) => res.status(201).send(product))
        .catch((error) => res.status(400).send(error));
    // } else {
    //     return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    // }
});

router.post('/del_id', function (req, res) {
    console.log("=======");
    console.log(req.body.id);
    // var token = getToken(req.headers);
    // if (token) {
    DetailDB
        .destroy({
            where: { id: req.body.id }
        })
        .then(() => {
            res.status(201).send({
                message: "Registro was deleted successfully!"
            });
        })
        .catch(() => res.status(400).send({error:"error"}));
    // } else {
    //     return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    // }
});

router.post('/check_token/', function (req, res) {
    console.log("====tk===");
    //console.log(req.headers);
    var token = getToken(req.headers);
    if (token) {
        res.json({ success: true, token: 'JWT ' + token, username: req.body.username });
    } else {
        res.json({ invalid: 1 });
    }
});

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;

