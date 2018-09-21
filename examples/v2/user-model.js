'use strict';

const Model = require('objection').Model;
const Authority = require('./authority-model');


class User extends Model {

  static get tableName() {
    return 'jhi_user';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['login', 'activated', 'created_by', 'created_date'],
      properties: {
        id: { type: 'bigInteger' },
        login: { type: 'string', minLength: 1, maxLength:50 },
        password_hash: { type: 'string', minLength: 1, maxLength: 60 },
        first_name: { type: 'string', minLength: 1, maxLength: 50 },
        last_name: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', minLength: 7, maxLength: 100 },
        image_url: { type: 'string', minLength: 1, maxLength: 256 },
        activated: { type: 'bit'},
        lang_key: { type: 'string', minLength: 2, maxLength: 6 },
        activation_key: { type: 'string', minLength: 1, maxLength: 20 },
        reset_key: { type: 'string', minLength: 1, maxLength: 20 },
        created_by: { type: 'string', minLength: 1, maxLength: 50 },
        created_date: { type: 'timestamp' },
        reset_date: { type: 'timestamp' },
        last_modified_by: { type: 'string', minLength: 1, maxLength: 50 },
        last_modified_date: { type: 'timestamp' }
      }
    };
  }

  static get relationMappings() {
    return {
      authorities: {
        relation: Model.ManyToManyRelation,
        modelClass: Authority,
        join: {
          from: 'jhi_user.id',
          through: {
            from: 'jhi_user_authority.user_id',
            to: 'jhi_user_authority.authority_name'
          },
          to: 'jhi_authority.name'
        }
      }
    };
  }

}

module.exports = User;