const { query } = require("express");
const { asyncForEach } = require("../helpers");

function SqlGo(model) {
  const originalForge = model.forge;
  let queryBuilder = model.forge();

  const api = {
    like,
    byId,
    eachLike,
    getSeries,
    getOne,
    isEqual,
    getWithPagination,
    isEqualSeries,
    save,
  };

  function like(column, value) {
    if (value) {
      queryBuilder = queryBuilder.where(column, "LIKE", `%${value}%`);
    }
    return api;
  }

  function eachLike(data, values) {
    values.forEach((value) => {
      if (data[value]) {
        queryBuilder.where(value, "LIKE", `%${data[value]}%`);
      }
    });
    return api;
  }

  api.biggerThan = (column, value) => {
    queryBuilder.where(column, ">", value);

    return api;
  };

  function isEqualSeries(column, values) {
    if (values) {
      queryBuilder = queryBuilder.query((qb) => {
        qb.whereIn(column, values);
      });
    }
    return api;
  }

  function isEqual(column, value) {
    queryBuilder = queryBuilder.where(column, value);
    return api;
  }

  function byId(value) {
    queryBuilder = queryBuilder.where("id", value);
    return api;
  }

  async function getSeries(params) {
    const columns = params?.columns || undefined;
    const withRelated = params?.withRelated || undefined;
    const pageSize = params?.pageSize || 25000;
    const page = params?.page || 1;
    if (columns) {
      queryBuilder = queryBuilder.query((qb) => qb.select(columns));
    }

    const finalQuery = await queryBuilder
      .fetchPage({
        pageSize,
        page,
        withRelated,
      })
      .then((rows) => rows.toJSON());

    queryBuilder = originalForge.call(model); // Zresetowanie zapytania
    return finalQuery;
  }

  async function getOne(params) {
    const columns = params?.columns || undefined;
    const withRelated = params?.withRelated || undefined;
    if (columns) {
      queryBuilder = queryBuilder.query((qb) => qb.select(columns));
    }

    const finalQuery = await queryBuilder.fetch().then((rows) => rows.toJSON());

    queryBuilder = originalForge.call(model); // Zresetowanie zapytania
    return finalQuery;
  }

  async function getWithPagination(params) {
    const columns = params?.columns || undefined;
    const withRelated = params?.withRelated || undefined;
    if (columns) {
      queryBuilder = queryBuilder.query((qb) => qb.select(columns));
    }

    const finalQuery = await queryBuilder
      .fetchPage({
        pageSize: 25000,
        page: 1,
        withRelated,
      })
      .then((rows) => ({
        data: rows.toJSON(),
        pagination: rows.pagination,
      }));

    queryBuilder = originalForge.call(model); // Zresetowanie zapytania
    return finalQuery;
  }

  async function save(data) {
    await queryBuilder.save(data);
    return true;
  }

  // Specific by project - Rentali

  api.getBiggestPoints = async () => {
    const finalQuery = await queryBuilder
      .query()
      .select("lodge_id")
      .sum("amount as total_points")
      .groupBy("lodge_id")
      .orderBy("total_points", "desc");

    queryBuilder = originalForge.call(model); // Zresetowanie zapytania

    return finalQuery;
  };

  return api;
}

module.exports = SqlGo;
