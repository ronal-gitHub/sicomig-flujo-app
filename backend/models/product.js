'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Products', {
    estado_proceso: DataTypes.INTEGER,
    estado_registro: DataTypes.INTEGER,
    base_datos: DataTypes.STRING,
    par_tramite: DataTypes.INTEGER,
    nombres_apellidos: DataTypes.STRING,
    procedencia: DataTypes.STRING,
    destino: DataTypes.STRING,
    fecha_viaje: DataTypes.DATE,
    puesto_control: DataTypes.STRING,
    lugar_tramite: DataTypes.STRING,
    cod_tramite: DataTypes.STRING,
    id_tramite_origen: DataTypes.INTEGER,
    id_persona: DataTypes.INTEGER,
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    numero_doc: DataTypes.STRING,
    fecha_nac: DataTypes.DATE,
    tipo_docL: DataTypes.STRING,
    serie: DataTypes.STRING,
  }, {});
  
  return Product;
};