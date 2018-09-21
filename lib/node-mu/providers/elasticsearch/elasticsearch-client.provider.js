'use strict';

const {provider} = require('../../ioc');
const Provider = require('../provider')
const config = require('config');
const elasticsearch = require('elasticsearch');
const path = require('path');
const fs = require('fs');

module.exports =
  provider(
    class ElasticsearchClient extends Provider {
      constructor() {
        super();
        this._esConfig = config.get('elasticsearch') || {
          host: 'localhost:9200',
          log: 'trace'
        };
      }

      async $start() {

        try {
          const esClientParams = {
            host: `${this._esConfig.host}:${this._esConfig.port}`,
            log: [{
              type: this._esConfig.log.type,
              level: this._esConfig.log.level,
              path: this._getLogFileName()
            }]
          };
          this._logger.debug(`Connecting to Elasticsearch: ${JSON.stringify(esClientParams)}`);

          this._elasticClient = new elasticsearch.Client(esClientParams);
        } catch (err) {
          throw err;
        }
      }

      _getLogFileName() {
        const fullPath = path.join(process.cwd(), this._esConfig.log.path);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath);
        }
        return path.join(fullPath, 'elasticsearch.log');
      }

      async $stop() {

      }

      get $healthId() {
        return 'elasticseacrh';
      }

      $isCheckableForHealth() {
        return true;
      }

      async $health() {
        return new Promise(async (resolve, reject) => {
          try {
            const up = await this._elasticClient.ping({
              requestTimeout: 30000,
            });
            if (up) {
              resolve({status: 'UP'})
            } else {
              resolve({status: 'DOWN'})
            }
          } catch (err) {
            reject({status: 'DOWN', message: err.stack});
          }

        });
      }


      get client() {
        return {

          ping: async () => {
            return new Promise(async (resolve, reject) => {
              try {
                await this._elasticClient.ping({
                  requestTimeout: 30000,
                });
                resolve(true)
              } catch (err) {
                console.log('ERROR: ' + err);
                console.log('ERROR: ' + JSON.stringify(err, null, 2));
                reject(false)
              }

            });
          },

          initIndex: async (indexName) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = await this._elasticClient.indices.create({
                  index: indexName
                });
                resolve(response);
              } catch (err) {
                reject(err)
              }
            });
          },

          indexExists: async (indexName) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.indices.exists({
                  index: indexName
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          initMapping: async (indexName, docType, payload) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.indices.putMapping({
                  index: indexName,
                  type: docType,
                  body: payload
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          addDocument: async (indexName, _id, docType, payload) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.index({
                  index: indexName,
                  type: docType,
                  id: _id,
                  body: payload
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          updateDocument: async (index, _id, docType, payload) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.update({
                  index: index,
                  type: docType,
                  id: _id,
                  body: payload
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          deleteDocument: async(index, _id, docType) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.delete({
                  index: index,
                  type: docType,
                  id: _id,
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          flush: async (indexName) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.indices.flush({
                  index: indexName
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          search: async (indexName, docType, payload) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.search({
                  index: indexName,
                  type: docType,
                  body: payload
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          // Search (paging--> size: dimensione pagina --> from: page*size)
          // check: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html
          pagingSearch: async (indexName, docType, payload, page, size) => {
            return new Promise(async (resolve, reject) => {
              const from = page*size;
              console.log('PAGE: ' + page + ' - Starting from: ' + from);
              try {
                const response = this._elasticClient.search({
                  index: indexName,
                  type: docType,
                  body: payload,
                  size: size,
                  from: from
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },

          // delete an index. pass '_all' to delete all indexes
          deleteIndex: async (indexName) => {
            return new Promise(async (resolve, reject) => {
              try {
                const response = this._elasticClient.indices.delete({
                  index: indexName
                });
                resolve(response);
              } catch (err) {
                reject(err);
              }
            });
          },
        }
      }

    }
  );