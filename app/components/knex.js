'use strict';

var Knex = require('knex');
var config = require('config');
var Promise = require('bluebird');
var _ = require('lodash');

/* Note: the method used to extend Knex below is a temporary workaround
 * until Knex provides a proper way to extend QueryBuilder.
 * See https://github.com/tgriesser/knex/issues/1158
 * (The workaround recommended there does not work starting from 0.12.0).
 */

/* Extends Knex with basic filtering support.
 * Parameters:
 * - filterQuery: object containing query values (e.g. req.query in Express)
 * - filters: object containing filters.
 *   Each filter object can have a field (default: same as filter name) and/or operator (default: 'contains')
 *   e.g. { name: {}, nim: { operator: '=' }, createdAfter: { field: 'created_at', operator: '>' } }
 *   Permitted operators are the same as Knex where operators
 *   except 'contains', which is the same as the 'like' operator but with '%' wildcards before and after the filter value.
 */
Object.getPrototypeOf(Knex.Client.prototype).filter = function (filterQuery, filters) {
  var query = this;
  for (var filterName in filters) {
    let filterField = filters[filterName].field || filterName;
    if (filterQuery[filterName] !== undefined) {
      let filterOperator = filters[filterName].operator || 'contains';
      let filterValue = filterQuery[filterName];
      if (filterOperator === 'contains') {
        filterOperator = 'like';
        filterValue = '%' + filterValue + '%';
      }
      query = query.where(filterField, filterOperator, filterValue);
    }
  }
  return query;
};

/* Extends Knex with basic sorting and pagination support. Sorting will be executed first, then paging.
 * Parameters:
 * - page: the page number to retrieve (pages start from 1), default is 1
 * - perPage: number of items per page, default is 20
 * - sort: comma-separated string of fields to sort by. Sorts ascending by default.
 *         Prefix field name with '-' to sort descending.
 *         e.g. 'name', '-nim', 'name, nim'
 * - sortableFields: whitelist array containing the names of fields that can be sorted.
 *   If it is not given, all fields will be sortable.
 * Inspired by https://gist.github.com/htmlpack/e9c6b6c3c22736aa6a1e8473311b115b
 */
Object.getPrototypeOf(Knex.Client.prototype).pageAndSort = function (page, perPage, sort, sortableFields) {
  var query = this;
  sort = (sort && typeof sort === 'string') ? sort.split(/\s*,\s*/) : []; // Split comma-delimited values
  var sortFields = [];
  if (!_.isArray) sortableFields = false;
  for (var i = 0; i < sort.length; i++) {
    let sortField = sort[i];
    let sortDirection = 'asc';
    if (_.startsWith(sortField, '+')) sortField = sortField.slice(1);
    if (_.startsWith(sortField, '-')) {
      sortField = sortField.slice(1).trim();
      sortDirection = 'desc';
    }
    if (!sortableFields || _.includes(sortableFields, sortField)) {
      sortFields.push({ field: sortField, direction: sortDirection });
      query = query.orderBy(sortField, sortDirection);
    }
  }

  var page = +page || 1;
  if (page < 1) page = 1;
  var perPage = +perPage || 20;
  var offset = (page - 1) * perPage;

  return Promise.all([
      query.clone().count('* as count').first(),
      query.offset(offset).limit(perPage)
    ]).then(function (values) {
      var totalCount = values[0].count;
      var rows = values[1];
      return {
        data: rows,
        currentPage: page,
        perPage: perPage,
        lastPage: Math.ceil(totalCount / perPage),
        totalCount: totalCount,
        sortFields: sortFields
      };
    });
};

module.exports = Knex(config.get('knex'));
