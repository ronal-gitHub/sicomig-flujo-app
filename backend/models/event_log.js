'use strict';

module.exports = (sequelize, DataTypes) => {
  const event_log = sequelize.define('event_log', {
    fte_inf_sigla : DataTypes.STRING,
	usuario_id :DataTypes.INTEGER,
	start_date :DataTypes.DATE,
	end_date :DataTypes.DATE,
	//user_ip : DataTypes.STRING,
	user_role: DataTypes.STRING,
	descripcion : DataTypes.STRING,
	param_qry : DataTypes.STRING,
	desc_qry : DataTypes.STRING,
	transaccion : DataTypes.STRING,
	//usuario_creacion varchar(30) NOT NULL DEFAULT "current_user"(),
  },
   {schema: 'dgm_scg_test',
    tableName: 'event_log',
    
});
  return event_log;
};
