const moment = require("moment");
//const { DATE_FORMAT } = require("./constants");
//const { Users, Terapeuci } = require("../models");

exports.removeById = async ({ id, model }) => {
  return await model
    .where({ id })
    .destroy()
    .then(event => {
      return event;
    });
};

exports.removeByData = async ({ data, model }) => {
  return await model
    .where(data)
    .destroy()
    .then(event => {
      return event;
    });
};

exports.getFileredData = (data, allowed) => {
  const newFilteredData = {};

  allowed.forEach(value => {
    newFilteredData[value] = data[value];
  });

  return newFilteredData;
};

exports.findAll = async ({
  data,
  model,
  query,
  allowedFilters,
  allowedEqualFilters,
  related,
  compartmentFilters,
}) => {
  let sqlQuery = model.forge();

  const defaultPageSize = 25;
  const defaultPage = 1;

  const defaultFetchParams = {
    pageSize: defaultPageSize,
    page: defaultPage,
  };

  if (related?.length) {
    const relations = related.map(relation => relation.relationType);
    defaultFetchParams.withRelated = relations;
  }

  if (query) {
    defaultFetchParams.page = Number(query.page) || defaultPage;

    if (query?.pageSize === "all") {
      defaultFetchParams.pageSize = 10000;
    } else if (query?.pageSize) {
      defaultFetchParams.pageSize = Number(query.pageSize);
    } else {
      defaultFetchParams.pageSize = defaultPageSize;
    }

    if (query && allowedFilters) {
      allowedFilters.forEach(filterName => {
        if (query[filterName]) {
          if (
            typeof query[filterName] === "string" &&
            query[filterName]?.includes(",")
          ) {
            sqlQuery = sqlQuery.where(filterName, "IN", query[filterName].split(","));
          } else {
            sqlQuery = sqlQuery.where(filterName, "LIKE", `%${query[filterName]}%`);
          }
        }
      });
    }

    if (query && allowedEqualFilters) {
      allowedEqualFilters.forEach(filterName => {
        if (query[filterName]) {
          sqlQuery = sqlQuery.where(filterName, "LIKE", `${query[filterName]}`);
        }
      });
    }

    if (compartmentFilters) {
      compartmentFilters.forEach(filter => {
        const { minValue, maxValue, key, minKey, maxKey } = filter;

        if (key) {
          sqlQuery.where(key, ">=", minValue).where(key, "<=", maxValue);
        } else {
          sqlQuery.where(minKey, ">=", minValue).where(maxKey, "<=", maxValue);
        }
      });
    }
  }

  const baseResponse = await sqlQuery
    .fetchPage({
      ...defaultFetchParams,
    })
    .then(response => {
      return {
        results: response.toJSON(),
        pagination: response.pagination,
      };
    });

  if (related?.length) {
    baseResponse.results.map(result => {
      const currentResult = result;
      related.forEach(type => {
        const filteredRelationData = {};
        const keys = type.keys;
        keys.forEach(key => {
          if (currentResult?.[type.relationType]?.[key]) {
            filteredRelationData[key] = currentResult[type.relationType][key];
          }
        });

        currentResult[type.relationType] = filteredRelationData;
      });
      return currentResult;
    });
  }

  return baseResponse;
};

exports.findById = async ({ id, model }) => {
  return await model
    .where({ id })
    .fetch()
    .then(response => {
      return response.toJSON();
    })
    .catch(() => {});
};

exports.findByData = async ({ data, model }) => {
  return await model
    .where(data)
    .fetch()
    .then(response => {
      if (response) {
        return response.toJSON();
      }
      return {};
    })
    .catch(() => {});
};

const adjustPayload = payload => {
  const adjustedPayload = payload;
  ["data", "data_od", "data_do", "termin"].forEach(key => {
    if (
      adjustedPayload[key] &&
      adjustedPayload[key].includes("T") // find better way with use momentjs
    ) {
      adjustedPayload[key] = moment(adjustedPayload[key]).format(DATE_FORMAT);
    }
  });
  return adjustedPayload;
};

exports.save = async ({ data, model, callback }) => {
  const adjustedData = adjustPayload(data);

  return await model
    .forge(adjustedData)
    .save()
    .then(response => {
      if (callback) {
        return callback(response);
      } else {
        return response.toJSON();
      }
    });
};

exports.OdevTimestamp = {
  getTimestamp: () => Date.now() / 1000,
};

exports.asyncForEach = async (collection, callback) => {
  const promises = [];

  let index = 0;

  while (index < collection.length) {
    promises.push(
      new Promise(resolve => {
        return resolve(callback(collection[index]));
      })
    );

    index++;
  }

  return Promise.all(promises).then(data => {
    return data;
  });
};