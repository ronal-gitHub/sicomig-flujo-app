'use strict';
module.exports = (sequelize, DataTypes) => {
  const inf_tramite = sequelize.define('inf_tramites', {
    tipo_bus: DataTypes.STRING,
    nombres_apellidos: DataTypes.STRING,
    fecha_nac: DataTypes.DATE,
    numero_doc: DataTypes.INTEGER,
    tipo_doc: DataTypes.STRING,
    pais_nac: DataTypes.STRING,
    serie: DataTypes.STRING,
    fecha_emi: DataTypes.DATE,
    fecha_ven: DataTypes.DATE,
    lugar_emi: DataTypes.STRING,
    estado: DataTypes.STRING,
    observacion: DataTypes.STRING
  }, {schema: 'dgm_scg_test',});
  return inf_tramite;
};