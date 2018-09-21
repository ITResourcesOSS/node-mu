'use strict';

const Model = require('objection').Model;

class Authority extends Model {

  static get tableName() {
    return 'jhi_authority';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 }
      }
    };
  }

  static get relationMappings() {
    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: __dirname + '/user-model',
        join: {
          from: 'jhi_authority.name',
          through: {
            from: 'jhi_user_authority.authority_name',
            to: 'jhi_user_authority.user_id'
          },
          to: 'jhi_user.id'
        }
      }
    };
  }
}

module.exports = Authority;
